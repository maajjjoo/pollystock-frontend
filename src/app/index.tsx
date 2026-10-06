import { useEffect, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';
import { useProductStore } from '@/features/products/hooks/use-product-store';
import { useMovementStore } from '@/features/stock/hooks/use-movement-store';
import { useCallback } from 'react';

export default function AppShell() {
  const { profile, loadConfig, isLoading: configLoading } = useConfigStore();
  const { products, loadProducts } = useProductStore();
  const { movements, loadMovements } = useMovementStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useFocusEffect(
    useCallback(() => {
      if (profile) {
        loadProducts();
        loadMovements();
      }
    }, [profile])
  );

  if (configLoading) {
    return (
      <Screen className="items-center justify-center bg-background">
        <ActivityIndicator size="large" color="rgb(var(--color-primary))" />
      </Screen>
    );
  }

  if (!profile) {
    return <WelcomeIntro />;
  }

  const recentMovements = movements.slice(0, 3);
  const totalItems = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);

  return (
    <Screen className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        
        {/* 1. HEADER */}
        <View className="mb-6 flex-row justify-between items-center">
          <View>
            <Text variant="caption" color="secondary" className="uppercase tracking-wider font-semibold mb-0.5">
              Hola, {profile.name}
            </Text>
            <Text variant="h2" className="text-2xl text-text font-bold">
              Tu inventario
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/settings' as any)} 
            className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-border shadow-sm active:opacity-70"
          >
            <SymbolView name="gearshape.fill" size={20} tintColor="rgb(var(--color-text-secondary))" />
          </TouchableOpacity>
        </View>

        {/* 2. MAIN INVENTORY SUMMARY */}
        <View className="mb-6 bg-primary rounded-[24px] p-6 shadow-sm">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-white/80 font-medium mb-1">Total de {profile.productType || 'artículos'}</Text>
              <Text className="text-white text-5xl font-bold tracking-tight">
                {products.length === 0 ? '0' : totalItems}
              </Text>
            </View>
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
              <SymbolView name="cube.box.fill" size={24} tintColor="white" />
            </View>
          </View>
          
          <View className="flex-row mt-6 pt-5 border-t border-white/20">
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-0.5">Productos únicos</Text>
              <Text className="text-white font-semibold text-lg">{products.length}</Text>
            </View>
          </View>
        </View>

        {/* 3. IMPORTANT INFORMATION (Empty state since no low stock computed yet) */}
        {products.length === 0 && (
          <View className="mb-8 bg-surface border border-border rounded-2xl p-5 flex-row items-center">
            <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
              <SymbolView name="info.circle.fill" size={18} tintColor="rgb(var(--color-primary))" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-text text-base">Comienza a explorar</Text>
              <Text variant="caption" color="secondary" className="mt-0.5">
                Agrega tu primer producto para ver información aquí.
              </Text>
            </View>
          </View>
        )}

        {/* 4. QUICK ACTIONS */}
        <Text variant="h3" className="mb-4 text-text">Acciones rápidas</Text>
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity 
            className="flex-1 bg-surface rounded-2xl p-4 items-center justify-center border border-border shadow-sm active:bg-surface-variant"
            onPress={() => router.push('/products/new' as any)}
          >
            <View className="mb-3 w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
              <SymbolView name="plus" size={22} tintColor="rgb(var(--color-primary))" />
            </View>
            <Text className="font-semibold text-sm text-center">Añadir producto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-surface rounded-2xl p-4 items-center justify-center border border-border shadow-sm active:bg-surface-variant"
            onPress={() => router.push('/movements/entry' as any)}
          >
            <View className="mb-3 w-12 h-12 bg-success/10 rounded-full items-center justify-center">
              <SymbolView name="arrow.down.to.line" size={22} tintColor="rgb(var(--color-success))" />
            </View>
            <Text className="font-semibold text-sm text-center">Registrar entrada</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-surface rounded-2xl p-4 items-center justify-center border border-border shadow-sm active:bg-surface-variant"
            onPress={() => router.push('/movements/exit' as any)}
          >
            <View className="mb-3 w-12 h-12 bg-warning/10 rounded-full items-center justify-center">
              <SymbolView name="arrow.up.to.line" size={22} tintColor="rgb(var(--color-warning))" />
            </View>
            <Text className="font-semibold text-sm text-center">Registrar salida</Text>
          </TouchableOpacity>
        </View>

        {/* 5. RECENT ACTIVITY */}
        <View className="flex-row justify-between items-end mb-4">
          <Text variant="h3" className="text-text">Actividad reciente</Text>
          {recentMovements.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/movements' as any)}>
              <Text className="text-primary font-medium text-sm">Ver todo</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {recentMovements.length === 0 ? (
          <View className="bg-surface rounded-2xl p-8 items-center border border-border">
            <View className="w-16 h-16 bg-surface-variant rounded-full items-center justify-center mb-4">
              <SymbolView name="doc.text.magnifyingglass" size={24} tintColor="rgb(var(--color-disabled))" />
            </View>
            <Text className="font-medium text-text mb-1">Aún no hay actividad</Text>
            <Text variant="caption" color="secondary" className="text-center">
              Tus entradas y salidas recientes aparecerán aquí.
            </Text>
          </View>
        ) : (
          <View className="bg-surface rounded-2xl border border-border overflow-hidden">
            {recentMovements.map((movement, idx) => {
              const product = products.find(p => p.id === movement.productId);
              const isEntry = movement.type === 'IN';
              
              return (
                <View 
                  key={movement.id} 
                  className={`p-4 flex-row items-center justify-between ${idx !== recentMovements.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <View className="flex-row items-center flex-1 pr-4">
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isEntry ? 'bg-success/10' : 'bg-warning/10'}`}>
                      <SymbolView name={isEntry ? "arrow.down" : "arrow.up"} size={16} tintColor={isEntry ? "rgb(var(--color-success))" : "rgb(var(--color-warning))"} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-text mb-0.5" numberOfLines={1}>
                        {product ? product.name : 'Producto eliminado'}
                      </Text>
                      <Text variant="caption" color="secondary">
                        {isEntry ? 'Entrada' : 'Salida'} · {new Date(movement.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text className={`font-semibold text-lg ${isEntry ? 'text-success' : 'text-text'}`}>
                    {isEntry ? '+' : '-'}{movement.quantity}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 6. BOTTOM NAVIGATION (Foundation/Visual Only) */}
      <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border flex-row items-center justify-between px-6 py-2 pb-6 shadow-sm">
        <View className="items-center opacity-100">
          <View className="mb-1 bg-primary/10 py-1 px-4 rounded-full">
            <SymbolView name="house.fill" size={22} tintColor="rgb(var(--color-primary))" />
          </View>
          <Text className="text-[10px] font-semibold text-primary">Inicio</Text>
        </View>
        
        <TouchableOpacity className="items-center opacity-50" onPress={() => router.push('/products' as any)}>
          <View className="mb-1 py-1 px-4">
            <SymbolView name="cube.box" size={22} tintColor="rgb(var(--color-text))" />
          </View>
          <Text className="text-[10px] font-medium text-text">Productos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center opacity-50" onPress={() => router.push('/movements' as any)}>
          <View className="mb-1 py-1 px-4">
            <SymbolView name="clock.arrow.circlepath" size={22} tintColor="rgb(var(--color-text))" />
          </View>
          <Text className="text-[10px] font-medium text-text">Movimientos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center opacity-50" onPress={() => router.push('/assistant' as any)}>
          <View className="mb-1 py-1 px-4">
            <SymbolView name="sparkles" size={22} tintColor="rgb(var(--color-text))" />
          </View>
          <Text className="text-[10px] font-medium text-text">Asistente</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

function WelcomeIntro() {
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
  }, []);

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
          <SymbolView name="cube.box.fill" size={48} tintColor="rgb(var(--color-primary))" />
        </View>
        
        <Text variant="h1" className="text-center mb-4 text-3xl font-bold">Tu asistente de inventario</Text>
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
