import { useState, useEffect } from 'react';
import { ScrollView, View, Alert, TouchableOpacity, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useProductStore } from '@/features/products/hooks/use-product-store';
import { useMovementStore } from '@/features/stock/hooks/use-movement-store';
import { Product, StockMovement } from '@/core/database/schema';
import { ValidationRules, sanitizeNumericInput } from '@/utils/validation';

export default function StockExitScreen() {
  const { productId: initialProductId } = useLocalSearchParams<{ productId?: string }>();
  const { products, saveProduct, loadProducts } = useProductStore();
  const { registerMovement } = useMovementStore();

  const [productId, setProductId] = useState<string>(initialProductId || '');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (products.length === 0) loadProducts();
  }, [products.length, loadProducts]);

  const selectedProduct = products.find(p => p.id === productId);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleConfirm = async () => {
    let hasError = false;
    const newErrors: Record<string, string> = {};

    if (!selectedProduct) {
      newErrors.product = 'Selecciona un producto.';
      hasError = true;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      newErrors.quantity = 'Ingresa una cantidad válida.';
      hasError = true;
    } else if (selectedProduct && qty > selectedProduct.stockQuantity) {
      newErrors.quantity = 'No hay suficiente stock.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      // 1. Update product stock
      const updatedProduct: Product = {
        ...selectedProduct!,
        stockQuantity: selectedProduct!.stockQuantity - qty,
      };
      await saveProduct(updatedProduct);

      // 2. Register movement
      const movement: StockMovement = {
        id: Date.now().toString(),
        productId: selectedProduct!.id,
        type: 'OUT',
        quantity: qty,
        date: new Date().toISOString(),
        note: note.trim() || undefined,
      };
      await registerMovement(movement);

      Alert.alert('Éxito', 'Salida registrada.');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar la salida. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (products.length === 0 && !loading) {
    return (
      <Screen className="items-center justify-center p-4 bg-background">
        <View className="w-16 h-16 bg-surface-variant rounded-full items-center justify-center mb-4">
          <SymbolView name="cube.box" size={32} tintColor="rgb(var(--color-disabled))" />
        </View>
        <Text variant="h2" className="mb-2 text-text">No hay productos</Text>
        <Text color="secondary" className="text-center mb-6">
          Agrega tu primer producto para registrar una salida.
        </Text>
        <Button title="Volver" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen className="bg-background">
      <View className="px-4 pt-4 pb-2 flex-row items-center border-b border-border/50">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <SymbolView name="chevron.left" size={24} tintColor="rgb(var(--color-text))" />
        </TouchableOpacity>
        <Text variant="h2" className="ml-2">Registrar salida</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="bg-surface rounded-[24px] p-5 border border-border shadow-sm mb-6">
          <Text variant="caption" className={`font-medium mb-1 ml-1 ${errors.product ? 'text-error' : 'text-text-secondary'}`}>Producto *</Text>
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            className={`bg-background border ${errors.product ? 'border-error' : 'border-border'} rounded-[24px] py-4 px-4 mb-1 flex-row justify-between items-center`}
          >
            <Text className={selectedProduct ? 'text-text font-medium' : 'text-disabled'}>
              {selectedProduct ? `${selectedProduct.name} (Stock: ${selectedProduct.stockQuantity})` : 'Seleccionar producto...'}
            </Text>
            <SymbolView name="chevron.down" size={16} tintColor="rgb(var(--color-disabled))" />
          </TouchableOpacity>
          {errors.product && <Text variant="caption" color="error" className="mb-4">{errors.product}</Text>}
          {!errors.product && <View className="mb-4" />}

          <TextInput 
            label="Cantidad *" 
            value={quantity} 
            onChangeText={(t) => { setQuantity(sanitizeNumericInput(t)); setErrors(prev => ({ ...prev, quantity: '' })); }} 
            keyboardType="numeric" 
            placeholder="0"
            maxLength={ValidationRules.QUANTITY_MAX}
            error={errors.quantity}
          />

          <TextInput 
            label="Nota (Opcional)" 
            value={note} 
            onChangeText={setNote} 
            placeholder="Ej. Venta o merma"
            maxLength={ValidationRules.NOTES_MAX}
            showCharCount
          />
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border p-4 pb-8 flex-row gap-4 shadow-sm">
        <Button title="Cancelar" variant="outline" onPress={() => router.back()} className="flex-1 py-4 rounded-xl" />
        <Button title="Guardar salida" variant="primary" loading={loading} onPress={handleConfirm} className="flex-1 py-4 rounded-xl bg-error border-error" />
      </View>

      {/* Product Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Screen className="bg-background">
          <View className="flex-row justify-between items-center p-4 border-b border-border/50">
            <Text variant="h2" >Seleccionar Producto</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="w-8 h-8 items-center justify-center bg-surface-variant rounded-full">
              <SymbolView name="xmark" size={16} tintColor="rgb(var(--color-text))" />
            </TouchableOpacity>
          </View>
          
          <View className="p-4 border-b border-border/50 bg-surface">
            <TextInput 
              placeholder="Buscar producto..." 
              value={search} 
              onChangeText={setSearch} 
              icon="magnifyingglass"
              className="mb-0"
            />
          </View>

          <ScrollView className="flex-1 bg-background">
            {filteredProducts.map(p => (
              <TouchableOpacity 
                key={p.id}
                onPress={() => {
                  setProductId(p.id);
                  setModalVisible(false);
                }}
                className={`px-6 py-4 border-b border-border/50 flex-row justify-between items-center ${p.stockQuantity <= 0 ? 'opacity-50' : 'active:bg-surface-variant'}`}
                disabled={p.stockQuantity <= 0}
              >
                <View>
                  <Text className="font-bold text-text mb-1">{p.name}</Text>
                  <Text variant="caption" color={p.stockQuantity <= 0 ? 'error' : 'secondary'}>
                    {p.stockQuantity <= 0 ? 'Sin stock disponible' : `Stock actual: ${p.stockQuantity} | SKU: ${p.sku || '-'}`}
                  </Text>
                </View>
                {productId === p.id && (
                  <SymbolView name="checkmark" size={18} tintColor="rgb(var(--color-primary))" />
                )}
              </TouchableOpacity>
            ))}
            {filteredProducts.length === 0 && (
              <View className="p-10 items-center">
                <Text color="secondary">No se encontraron productos</Text>
              </View>
            )}
          </ScrollView>
        </Screen>
      </Modal>
    </Screen>
  );
}
