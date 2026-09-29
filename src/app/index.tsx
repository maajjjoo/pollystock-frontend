import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
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
    <Screen className="p-6">
      <View className="mb-8">
        <Text variant="h1" className="mb-2">{profile.name}</Text>
        <Text variant="body" color="secondary">
          Negocio: {profile.businessType} | Productos: {profile.productType}
        </Text>
      </View>

      <Card className="mb-6">
        <Text variant="h3" className="mb-4">Reglas Activas</Text>
        <View className="space-y-2">
          <Text>• Categorías: {profile.useCategories ? 'Sí' : 'No'}</Text>
          <Text>• Códigos de Producto: {profile.useProductCodes ? 'Sí' : 'No'}</Text>
          <Text>• Stock Mínimo: {profile.useMinStock ? 'Sí' : 'No'}</Text>
          <Text>• Fechas de Vencimiento: {profile.useExpirationDates ? 'Sí' : 'No'}</Text>
        </View>
      </Card>

      <Card className="mb-6">
        <Text variant="h3" className="mb-4">Atributos Dinámicos</Text>
        {attributes.length === 0 ? (
          <Text color="secondary">No se configuraron atributos dinámicos.</Text>
        ) : (
          <View className="space-y-2">
            {attributes.map(attr => (
              <Text key={attr.id}>
                • {attr.name} ({attr.dataType}) {attr.isRequired ? '*' : ''}
              </Text>
            ))}
          </View>
        )}
      </Card>
      
      <View className="gap-3">
        <View className="flex-row gap-3">
          <Button 
            title="Entrada" 
            variant="outline" 
            onPress={() => router.push('/movements/entry' as any)} 
            className="flex-1 border-success"
          />
          <Button 
            title="Salida" 
            variant="outline" 
            onPress={() => router.push('/movements/exit' as any)} 
            className="flex-1 border-warning"
          />
        </View>
        <Button 
          title="Ver Historial de Movimientos" 
          variant="secondary" 
          onPress={() => router.push('/movements' as any)} 
        />
        <Button 
          title="Catálogo de Productos" 
          variant="primary" 
          onPress={() => router.push('/products' as any)} 
        />
        <Button 
          title="Editar Configuración" 
          variant="outline" 
          onPress={() => router.push('/setup' as any)} 
        />
      </View>
    </Screen>
  );
}
