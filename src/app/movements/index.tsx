import { useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useMovementStore } from '@/features/stock/hooks/use-movement-store';
import { useProductStore } from '@/features/products/hooks/use-product-store';

export default function MovementHistoryScreen() {
  const { movements, loadMovements, isLoading } = useMovementStore();
  const { products, loadProducts } = useProductStore();

  useEffect(() => {
    loadProducts();
    loadMovements();
  }, [loadProducts, loadMovements]);

  return (
    <Screen className="p-4">
      <View className="flex-row items-center justify-between mb-6">
        <Text variant="h1">Historial</Text>
        <Button title="Volver" variant="outline" onPress={() => router.back()} className="py-2 px-4" />
      </View>

      <FlatList
        data={movements}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40, gap: 12 }}
        refreshing={isLoading}
        onRefresh={() => loadMovements()}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text color="secondary">No se han registrado movimientos.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const product = products.find(p => p.id === item.productId);
          const isEntry = item.type === 'IN';

          return (
            <Card>
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="font-bold text-lg">
                    {product ? product.name : 'Producto Desconocido'}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {new Date(item.date).toLocaleString()}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`font-bold text-lg ${isEntry ? 'text-success' : 'text-error'}`}>
                    {isEntry ? '+' : '-'}{item.quantity}
                  </Text>
                  <Text variant="caption" className={isEntry ? 'text-success' : 'text-error'}>
                    {isEntry ? 'ENTRADA' : 'SALIDA'}
                  </Text>
                </View>
              </View>

              {item.note && (
                <View className="mt-2 bg-surface p-2 rounded-md border border-border">
                  <Text variant="caption" color="secondary">Nota: {item.note}</Text>
                </View>
              )}
            </Card>
          );
        }}
      />
    </Screen>
  );
}
