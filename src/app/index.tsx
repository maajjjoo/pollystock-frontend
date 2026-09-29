import { useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
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
    return (
      <Screen className="p-6 justify-center items-center">
        <View className="mb-8 items-center">
          <Text variant="h1" className="text-center mb-2">Bienvenido a Polly Stock</Text>
          <Text variant="body" color="secondary" className="text-center">
            Parece que es la primera vez que usas la aplicación.
          </Text>
        </View>
        <Button 
          title="Configurar mi Inventario" 
          variant="primary" 
          onPress={() => router.push('/setup' as any)} 
          className="w-full"
        />
      </Screen>
    );
  }

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
          title="⚙️" 
          variant="outline" 
          onPress={() => router.push('/setup' as any)} 
          className="rounded-full w-12 h-12 p-0 items-center justify-center border-border"
        />
      </View>

      <Text variant="h3" className="mb-3 text-text-secondary">Operaciones Rápidas</Text>
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity 
          className="flex-1 bg-success/10 rounded-2xl p-4 items-center justify-center border border-success/20 active:bg-success/20"
          onPress={() => router.push('/movements/entry' as any)}
        >
          <Text className="text-3xl mb-2">📥</Text>
          <Text className="font-bold text-success">Entrada</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 bg-warning/10 rounded-2xl p-4 items-center justify-center border border-warning/20 active:bg-warning/20"
          onPress={() => router.push('/movements/exit' as any)}
        >
          <Text className="text-3xl mb-2">📤</Text>
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
            <Text className="text-2xl">📦</Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-lg">Catálogo de Productos</Text>
            <Text variant="caption" color="secondary">Añade, edita o busca productos</Text>
          </View>
          <Text className="text-text-secondary text-xl">›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-surface rounded-2xl p-5 flex-row items-center border border-border shadow-sm active:opacity-80"
          onPress={() => router.push('/movements' as any)}
        >
          <View className="bg-secondary/10 w-12 h-12 rounded-full items-center justify-center mr-4">
            <Text className="text-2xl">📋</Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-lg">Historial de Movimientos</Text>
            <Text variant="caption" color="secondary">Revisa todas las entradas y salidas</Text>
          </View>
          <Text className="text-text-secondary text-xl">›</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
