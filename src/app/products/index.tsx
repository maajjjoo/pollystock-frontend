import { useEffect, useState, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
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
    <Screen className="bg-background">
      <View className="px-4 pt-4 pb-2">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text variant="h2" className="text-2xl text-text font-bold">Productos</Text>
          <TouchableOpacity 
            onPress={() => router.push('/products/new' as any)} 
            className="flex-row items-center bg-primary rounded-full px-4 py-2 active:opacity-80 shadow-sm"
          >
            <SymbolView name="plus" size={16} tintColor="white" />
            <Text className="text-white font-medium ml-1">Nuevo</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TextInput 
          placeholder="Buscar producto" 
          value={search}
          onChangeText={setSearch}
          icon="magnifyingglass"
          className="mb-2"
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-4">
            <View className="w-16 h-16 bg-surface-variant rounded-full items-center justify-center mb-4">
              <SymbolView name="cube.box" size={32} tintColor="rgb(var(--color-disabled))" />
            </View>
            <Text variant="h3" className="text-text mb-1">No hay productos</Text>
            <Text variant="caption" color="secondary" className="text-center mb-6 text-base">
              Agrega tu primer producto para empezar.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/products/new' as any)} 
              className="bg-primary px-6 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-white font-semibold">Agregar producto</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          // Determine stock status
          let stockStatusColor = "text-text-secondary";
          let stockStatusBg = "bg-transparent";
          let stockStatusLabel = "";
          
          if (item.stockQuantity === 0) {
            stockStatusColor = "text-error";
            stockStatusBg = "bg-error/10";
            stockStatusLabel = "Sin stock";
          } else if (profile?.useMinStock && item.stockQuantity <= (profile as any).minStock) {
            stockStatusColor = "text-warning";
            stockStatusBg = "bg-warning/10";
            stockStatusLabel = "Stock bajo";
          }

          return (
            <TouchableOpacity 
              onPress={() => router.push(`/products/${item.id}` as any)}
              className="bg-surface rounded-2xl p-3 border border-border shadow-sm flex-row items-center active:bg-surface-variant"
            >
              {/* Product Image */}
              <View className="w-16 h-16 rounded-xl bg-surface-variant border border-border items-center justify-center overflow-hidden mr-3">
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <SymbolView name="photo" size={24} tintColor="rgb(var(--color-disabled))" />
                )}
              </View>

              {/* Product Info */}
              <View className="flex-1 justify-center">
                <Text className="font-semibold text-text text-base mb-0.5" numberOfLines={1}>{item.name}</Text>
                
                <View className="flex-row items-center">
                  <Text variant="caption" color="secondary" className="font-medium">
                    {item.stockQuantity} {profile?.defaultUnit}
                  </Text>
                  {item.categoryId && (
                    <>
                      <Text variant="caption" color="secondary" className="mx-1.5">•</Text>
                      <Text variant="caption" color="secondary">{item.categoryId}</Text>
                    </>
                  )}
                </View>
              </View>

              {/* Stock Status / Actions */}
              <View className="items-end justify-center">
                {stockStatusLabel ? (
                  <View className={`${stockStatusBg} px-2.5 py-1 rounded-md mb-1`}>
                    <Text className={`text-[10px] font-bold ${stockStatusColor} uppercase tracking-wider`}>
                      {stockStatusLabel}
                    </Text>
                  </View>
                ) : null}
                <SymbolView name="chevron.right" size={16} tintColor="rgb(var(--color-disabled))" />
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* BOTTOM NAVIGATION (Foundation/Visual Only) */}
      <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border flex-row items-center justify-between px-6 py-2 pb-6 shadow-sm">
        <TouchableOpacity className="items-center opacity-50" onPress={() => router.push('/' as any)}>
          <View className="mb-1 py-1 px-4">
            <SymbolView name="house" size={22} tintColor="rgb(var(--color-text))" />
          </View>
          <Text className="text-[10px] font-medium text-text">Inicio</Text>
        </TouchableOpacity>
        
        <View className="items-center opacity-100">
          <View className="mb-1 bg-primary/10 py-1 px-4 rounded-full">
            <SymbolView name="cube.box.fill" size={22} tintColor="rgb(var(--color-primary))" />
          </View>
          <Text className="text-[10px] font-semibold text-primary">Productos</Text>
        </View>
        
        <TouchableOpacity className="items-center opacity-50" onPress={() => router.push('/movements' as any)}>
          <View className="mb-1 py-1 px-4">
            <SymbolView name="clock.arrow.circlepath" size={22} tintColor="rgb(var(--color-text))" />
          </View>
          <Text className="text-[10px] font-medium text-text">Movimientos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center opacity-50">
          <View className="mb-1 py-1 px-4">
            <SymbolView name="sparkles" size={22} tintColor="rgb(var(--color-text))" />
          </View>
          <Text className="text-[10px] font-medium text-text">Asistente</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
