import { useEffect, useState, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useProductStore } from '@/features/products/hooks/use-product-store';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';

export default function ProductsListScreen() {
  const { products, loadProducts } = useProductStore();
  const { profile } = useConfigStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const lowerSearch = search.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerSearch) ||
      (p.sku && p.sku.toLowerCase().includes(lowerSearch)) ||
      (p.categoryId && p.categoryId.toLowerCase().includes(lowerSearch))
    );
  }, [products, search]);

  return (
    <Screen className="p-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text variant="h1">Productos</Text>
        <Button 
          title="+ Nuevo" 
          variant="primary" 
          onPress={() => router.push('/products/new' as any)} 
          className="py-2 px-4"
        />
      </View>

      <TextInput 
        placeholder="Buscar por nombre, código, categoría..." 
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40, gap: 12 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text color="secondary">No se encontraron productos.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/products/${item.id}` as any)}>
            <Card>
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="font-bold text-lg">{item.name}</Text>
                  {item.sku && <Text variant="caption" color="secondary">SKU: {item.sku}</Text>}
                </View>
                <View className="items-end">
                  <Text className="font-bold text-primary">${item.basePrice.toFixed(2)}</Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center mt-2">
                {item.categoryId ? (
                  <View className="bg-disabled-bg px-2 py-1 rounded-md">
                    <Text variant="caption">{item.categoryId}</Text>
                  </View>
                ) : <View />}
                
                <Text variant="caption" className="font-medium">
                  Stock: {item.stockQuantity} {profile?.defaultUnit}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}
