import { useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useMovementStore } from '@/features/stock/hooks/use-movement-store';
import { useProductStore } from '@/features/products/hooks/use-product-store';
import { BottomNav } from '@/components/ui/BottomNav';
import { SymbolView } from 'expo-symbols';

export default function MovementHistoryScreen() {
  const { movements, loadMovements, isLoading } = useMovementStore();
  const { products, loadProducts } = useProductStore();

  useEffect(() => {
    loadProducts();
    loadMovements();
  }, [loadProducts, loadMovements]);

  return (
    <Screen className="bg-background">
      <View className="px-6 pt-6 pb-4 border-b border-border/50 bg-background/90 flex-row items-center justify-between">
        <Text variant="h2">Movimientos</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={() => router.push('/movements/entry' as any)} 
            activeOpacity={0.8}
            className="flex-row items-center gap-1.5 bg-success/15 border border-success/30 px-3.5 py-2 rounded-xl active:opacity-70"
          >
            <SymbolView name="plus" size={14} tintColor="rgb(var(--color-success))" />
            <Text className="text-success font-semibold text-xs">Entrada</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/movements/exit' as any)} 
            activeOpacity={0.8}
            className="flex-row items-center gap-1.5 bg-error/15 border border-error/30 px-3.5 py-2 rounded-xl active:opacity-70"
          >
            <SymbolView name="minus" size={14} tintColor="rgb(var(--color-error))" />
            <Text className="text-error font-semibold text-xs">Salida</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={movements}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100, gap: 12 }}
        refreshing={isLoading}
        onRefresh={() => loadMovements()}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-4">
            <View className="w-16 h-16 bg-surface-variant rounded-full items-center justify-center mb-4">
              <SymbolView name="clock.arrow.circlepath" size={32} tintColor="rgb(var(--color-disabled))" />
            </View>
            <Text variant="h3" className="text-text mb-1">No hay movimientos</Text>
            <Text variant="caption" color="secondary" className="text-center text-base mb-6">
              Los registros de entradas y salidas aparecerán aquí.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => router.push('/movements/entry' as any)} 
                activeOpacity={0.8}
                className="bg-success px-5 py-2.5 rounded-xl active:opacity-80 flex-row items-center gap-1.5"
              >
                <SymbolView name="plus" size={14} tintColor="#ffffff" />
                <Text className="text-white font-semibold text-sm">Registrar entrada</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/movements/exit' as any)} 
                activeOpacity={0.8}
                className="bg-error px-5 py-2.5 rounded-xl active:opacity-80 flex-row items-center gap-1.5"
              >
                <SymbolView name="minus" size={14} tintColor="#ffffff" />
                <Text className="text-white font-semibold text-sm">Registrar salida</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const product = products.find(p => p.id === item.productId);
          const isEntry = item.type === 'IN' || (item.type as any) === 'ENTRY';

          return (
            <View className="bg-surface py-4 px-4 border-b border-border/50">
              <View className="flex-row justify-between items-center mb-1">
                <View className="flex-1">
                  <Text variant="body" className="font-medium text-text">
                    {product ? product.name : 'Producto Desconocido'}
                  </Text>
                </View>
                <View className="items-end pl-4">
                  <Text variant="body" className={`font-semibold ${isEntry ? 'text-success' : 'text-error'}`}>
                    {isEntry ? '+' : '-'}{item.quantity}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text variant="caption" color="secondary">
                  {new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </Text>
                <Text variant="caption" className={`text-[10px] font-semibold tracking-wider ${isEntry ? 'text-success' : 'text-error'}`}>
                  {isEntry ? 'ENTRADA' : 'SALIDA'}
                </Text>
              </View>

              {item.note && (
                <View className="mt-2 bg-background p-2.5 rounded-lg border border-border/60">
                  <Text variant="caption" color="secondary" className="italic">{item.note}</Text>
                </View>
              )}
            </View>
          );
        }}
      />
      <BottomNav />
    </Screen>
  );
}
