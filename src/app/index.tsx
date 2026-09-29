import { useEffect, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';

export default function AppShell() {
  const { profile, attributes, isLoading, loadConfig } = useConfigStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="rgb(var(--color-primary))" />
        <Text className="mt-4">Cargando...</Text>
      </Screen>
    );
  }

  if (!profile) {
    return <WelcomeIntro />;
  }

  // Dashboard ... (rest of the file remains unmodified inside this replace block)

  return (
    <Screen className="p-4 bg-background">
      <View className="mb-6 mt-2 flex-row justify-between items-center">
        <View>
          <Text variant="h1" className="text-2xl font-bold">{profile.name}</Text>
          <Text variant="caption" color="secondary" className="mt-1 font-medium">
            {profile.businessType}
          </Text>
        </View>
        <Button 
          title="" 
          variant="outline" 
          onPress={() => router.push('/setup' as any)} 
          className="rounded-full w-12 h-12 p-0 items-center justify-center border-border"
        >
          <SymbolView name="gear" size={24} tintColor="rgb(var(--color-text-secondary))" />
        </Button>
      </View>

      <Text variant="h3" className="mb-3 text-text-secondary">Operaciones Rápidas</Text>
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity 
          className="flex-1 bg-success/10 rounded-2xl p-4 items-center justify-center border border-success/20 active:bg-success/20"
          onPress={() => router.push('/movements/entry' as any)}
        >
          <SymbolView name="arrow.down.doc.fill" size={32} tintColor="rgb(var(--color-success))" style={{ marginBottom: 8 }} />
          <Text className="font-bold text-success">Entrada</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 bg-warning/10 rounded-2xl p-4 items-center justify-center border border-warning/20 active:bg-warning/20"
          onPress={() => router.push('/movements/exit' as any)}
        >
          <SymbolView name="arrow.up.doc.fill" size={32} tintColor="rgb(var(--color-warning))" style={{ marginBottom: 8 }} />
          <Text className="font-bold text-warning">Salida</Text>
        </TouchableOpacity>
      </View>

      <Text variant="h3" className="mb-3 text-text-secondary">Gestión</Text>
      <View className="gap-3">
        <TouchableOpacity 
          className="bg-surface rounded-2xl p-5 flex-row items-center border border-border shadow-sm active:opacity-80"
          onPress={() => router.push('/products' as any)}
        >
          <View className="bg-primary/10 w-12 h-12 rounded-full items-center justify-center mr-4">
            <SymbolView name="shippingbox.fill" size={24} tintColor="rgb(var(--color-primary))" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-lg">Catálogo de Productos</Text>
            <Text variant="caption" color="secondary">Añade, edita o busca productos</Text>
          </View>
          <SymbolView name="chevron.right" size={20} tintColor="rgb(var(--color-text-secondary))" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-surface rounded-2xl p-5 flex-row items-center border border-border shadow-sm active:opacity-80"
          onPress={() => router.push('/movements' as any)}
        >
          <View className="bg-secondary/10 w-12 h-12 rounded-full items-center justify-center mr-4">
            <SymbolView name="clock.fill" size={24} tintColor="rgb(var(--color-secondary))" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-lg">Historial de Movimientos</Text>
            <Text variant="caption" color="secondary">Revisa todas las entradas y salidas</Text>
          </View>
          <SymbolView name="chevron.right" size={20} tintColor="rgb(var(--color-text-secondary))" />
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
        <View className="w-20 h-20 bg-primary/10 rounded-3xl items-center justify-center mb-8">
          <SymbolView name="cube.box" size={40} tintColor="rgb(var(--color-primary))" />
        </View>
        
        <Text variant="h1" className="text-center mb-3">Tu asistente de inventario</Text>
        <Text variant="body" color="secondary" className="text-center mb-10 text-lg">
          Organiza tus productos y controla tu inventario desde un solo lugar.
        </Text>

        <Button 
          title="Comenzar" 
          variant="primary" 
          onPress={() => router.push('/setup' as any)} 
          className="w-full max-w-sm"
        />
      </Animated.View>
    </Screen>
  );
}
