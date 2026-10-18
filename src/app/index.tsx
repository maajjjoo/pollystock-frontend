import { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';
import { useProductStore } from '@/features/products/hooks/use-product-store';
import { useMovementStore } from '@/features/stock/hooks/use-movement-store';
import { BottomNav } from '@/components/ui/BottomNav';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { profile, isLoading: configLoading } = useConfigStore();
  const { products, loadProducts, isLoading: productsLoading } = useProductStore();
  const { movements, loadMovements, isLoading: movementsLoading } = useMovementStore();

  useFocusEffect(
    useCallback(() => {
      if (profile && !configLoading) {
        loadProducts();
        loadMovements();
      }
    }, [profile, configLoading])
  );

  if (configLoading) {
    return (
      <Screen className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (!configLoading && !profile) {
    return <WelcomeIntro />;
  }

  const isLoading = productsLoading || movementsLoading;

  // Calculate metrics
  const totalProducts = products.length;
  const lowStockThreshold = profile?.useMinStock ? profile.minStock || 5 : 0;
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0);
  const lowStockProducts = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= lowStockThreshold);
  
  const recentMovements = [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  
  // Format Date (Martes, 21 de mayo)
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formattedDate = today.toLocaleDateString('es-ES', dateOptions).replace(',', '');
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <Screen className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header: Logo and Bell */}
        <View className="px-6 pt-2 pb-6 flex-row justify-between items-center border-b border-border">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-primary rounded-xl items-center justify-center mr-3 shadow-sm">
              <SymbolView name="cube.box" size={24} tintColor="white" />
            </View>
            <Text className="text-xl font-bold text-text">PollyStock</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/settings' as any)}
            className="w-10 h-10 rounded-full border border-border items-center justify-center bg-surface"
            accessibilityLabel="Configuración del negocio"
          >
            <SymbolView name="gearshape" size={20} tintColor={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Greeting Section */}
        <View className="px-6 pt-6 pb-6">
          <Text className="text-3xl font-bold text-text mb-2">¡Hola, {profile?.name?.split(' ')[0] || 'Usuario'}!</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-text-secondary text-base">{profile?.name || 'Mi Negocio'}</Text>
            <Text className="text-text-secondary text-base">{capitalizedDate}</Text>
          </View>
        </View>

        {/* Resumen de Inventario */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-bold text-text mb-4">Resumen de inventario</Text>
          <View className="flex-row gap-4">
            {/* Card 1: Productos */}
            <View className="flex-1 bg-surface border border-border rounded-[20px] p-4 shadow-sm">
              <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mb-3">
                <SymbolView name="square.stack.3d.up" size={20} tintColor={colors.primary} />
              </View>
              <Text className="text-3xl font-bold text-text mb-1">{totalProducts}</Text>
              <Text className="text-sm text-text-secondary">Productos</Text>
            </View>
            
            {/* Card 2: Stock bajo */}
            <View className="flex-1 bg-surface border border-border rounded-[20px] p-4 shadow-sm">
              <View className="w-10 h-10 bg-warning/10 rounded-full items-center justify-center mb-3">
                <SymbolView name="exclamationmark.triangle" size={20} tintColor={colors.warning} />
              </View>
              <Text className="text-3xl font-bold text-text mb-1">{lowStockProducts.length}</Text>
              <Text className="text-sm text-text-secondary">Stock bajo</Text>
            </View>
            
            {/* Card 3: Agotados */}
            <View className="flex-1 bg-surface border border-border rounded-[20px] p-4 shadow-sm">
              <View className="w-10 h-10 bg-error/10 rounded-full items-center justify-center mb-3">
                <SymbolView name="cube.box" size={20} tintColor={colors.error} />
              </View>
              <Text className="text-3xl font-bold text-text mb-1">{outOfStockProducts.length}</Text>
              <Text className="text-sm text-text-secondary">Agotados</Text>
            </View>
          </View>
        </View>

        {/* Primary Action Button */}
        <View className="px-6 mb-8">
          <Button 
            title="Agregar producto" 
            icon="plus" 
            variant="primary" 
            onPress={() => router.push('/products/new' as any)} 
          />
        </View>

        {/* Alertas de inventario */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-lg font-bold text-text">Alertas de inventario</Text>
            <TouchableOpacity onPress={() => router.push('/products' as any)} className="flex-row items-center">
              <Text className="text-primary font-medium text-sm mr-1">Ver inventario</Text>
              <SymbolView name="chevron.right" size={12} tintColor={colors.primary} />
            </TouchableOpacity>
          </View>

          {lowStockProducts.length > 0 ? (
            <TouchableOpacity 
              onPress={() => router.push(`/products/${lowStockProducts[0].id}` as any)}
              className="bg-surface rounded-2xl border border-border shadow-sm flex-row items-center overflow-hidden"
            >
              <View className="w-1.5 h-full bg-warning absolute left-0 top-0 bottom-0 z-10" />
              <View className="p-4 pl-6 flex-row items-center w-full">
                <View className="w-12 h-12 bg-warning/10 rounded-xl items-center justify-center mr-4">
                  <SymbolView name="cube.box" size={24} tintColor={colors.warning} />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-text text-base mb-0.5" numberOfLines={1}>{lowStockProducts[0].name}</Text>
                  <Text className="text-text-secondary text-sm">Quedan {lowStockProducts[0].stockQuantity} {profile?.defaultUnit || 'unidades'}</Text>
                </View>
                <View className="bg-warning/20 px-3 py-1.5 rounded-full ml-2">
                  <Text className="text-warning text-xs font-bold">Stock bajo</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="bg-surface rounded-2xl border border-border p-5 items-center justify-center">
              <Text className="text-text-secondary">No hay alertas de stock bajo</Text>
            </View>
          )}
        </View>

        {/* Análisis inteligente */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-bold text-text mb-4">Análisis inteligente</Text>
          <View className="bg-primary/5 rounded-[20px] p-5">
            <View className="flex-row items-start mb-4">
              <View className="w-12 h-12 bg-surface rounded-xl items-center justify-center mr-4 shadow-sm border border-border/50">
                <SymbolView name="sparkles" size={24} tintColor={colors.primary} />
              </View>
              <View className="flex-1 pt-1">
                <Text className="font-bold text-text text-base mb-2">Una oportunidad para reponer</Text>
                <Text className="text-text-secondary text-sm leading-relaxed mb-1">
                  {lowStockProducts.length > 0 
                    ? `${lowStockProducts.length} productos se venden con frecuencia y tienen poco stock. Revisa las existencias antes de tu próxima compra.`
                    : 'Tu inventario se encuentra en un estado óptimo. Sigue registrando tus ventas y entradas para obtener más recomendaciones.'}
                </Text>
              </View>
            </View>
            <View className="h-px bg-border/50 my-3" />
            <View className="flex-row justify-between items-center">
              <Text className="text-text-secondary text-xs">Basado en movimientos recientes</Text>
              <TouchableOpacity onPress={() => router.push('/assistant' as any)} className="flex-row items-center">
                <Text className="text-primary font-medium text-sm mr-1">Ver análisis</Text>
                <SymbolView name="chevron.right" size={12} tintColor={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Actividad reciente */}
        <View className="px-6 mb-4">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-lg font-bold text-text">Actividad reciente</Text>
            {recentMovements.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/movements' as any)} className="flex-row items-center">
                <Text className="text-primary font-medium text-sm mr-1">Ver todo</Text>
                <SymbolView name="chevron.right" size={12} tintColor={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          {recentMovements.length === 0 ? (
            <View className="bg-surface rounded-2xl border border-border p-6 items-center">
              <Text className="text-text-secondary">No hay actividad reciente.</Text>
            </View>
          ) : (
            <View className="bg-surface rounded-2xl border border-border overflow-hidden">
              {recentMovements.map((movement, idx) => {
                const product = products.find(p => p.id === movement.productId);
                const isEntry = movement.type === 'IN';
                
                return (
                  <View 
                    key={movement.id} 
                    className={`p-4 flex-row items-center justify-between ${idx !== recentMovements.length - 1 ? 'border-b border-border/50' : ''}`}
                  >
                    <View className="flex-row items-center flex-1 pr-4">
                      <View className="flex-1">
                        <Text className="font-bold text-text text-base mb-0.5" numberOfLines={1}>
                          {product ? product.name : 'Producto eliminado'}
                        </Text>
                        <Text className="text-text-secondary text-xs">
                          {isEntry ? 'Entrada' : 'Salida'} • {new Date(movement.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text className={`font-bold text-base ${isEntry ? 'text-success' : 'text-text'}`}>
                      {isEntry ? '+' : '-'}{movement.quantity}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <BottomNav />
    </Screen>
  );
}

function WelcomeIntro() {
  const { colors } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Screen className="bg-background flex-1 justify-center p-6">
      <Animated.View 
        style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }],
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center'
        }}
      >
        <View className="w-24 h-24 bg-primary/10 rounded-[32px] items-center justify-center mb-10">
          <SymbolView name="cube.box.fill" size={48} tintColor={colors.primary} />
        </View>
        
        <Text variant="h1" className="text-center mb-4">Tu asistente de inventario</Text>
        <Text variant="body" color="secondary" className="text-center mb-12 text-lg px-4 leading-relaxed">
          Organiza tus productos y controla tu inventario fácilmente.
        </Text>

        <Button 
          title="Comenzar" 
          variant="primary" 
          onPress={() => router.push('/setup' as any)} 
          className="w-full max-w-sm py-4 rounded-2xl"
        />
      </Animated.View>
    </Screen>
  );
}
