import { useState, useEffect } from 'react';
import { ScrollView, View, Alert, TouchableOpacity, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useProductStore } from '@/features/products/hooks/use-product-store';
import { useMovementStore } from '@/features/stock/hooks/use-movement-store';
import { Product, StockMovement } from '@/core/database/schema';

export default function StockEntryScreen() {
  const { productId: initialProductId } = useLocalSearchParams<{ productId?: string }>();
  const { products, saveProduct, loadProducts } = useProductStore();
  const { registerMovement } = useMovementStore();

  const [productId, setProductId] = useState<string>(initialProductId || '');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal for product selection
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (products.length === 0) loadProducts();
  }, [products.length, loadProducts]);

  const selectedProduct = products.find(p => p.id === productId);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleConfirm = async () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Selecciona un producto.');
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Ingresa una cantidad válida.');
      return;
    }

    setLoading(true);
    try {
      // 1. Update product stock
      const updatedProduct: Product = {
        ...selectedProduct,
        stockQuantity: selectedProduct.stockQuantity + qty,
      };
      await saveProduct(updatedProduct);

      // 2. Register movement
      const movement: StockMovement = {
        id: Date.now().toString(),
        productId: selectedProduct.id,
        type: 'IN',
        quantity: qty,
        date: new Date().toISOString(),
        note: note.trim() || undefined,
      };
      await registerMovement(movement);

      Alert.alert('Guardado', 'Entrada registrada.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (products.length === 0 && !loading) {
    return (
      <Screen className="items-center justify-center p-4">
        <Text variant="h2" className="mb-2">No hay productos</Text>
        <Text color="secondary" className="text-center mb-6">
          Agrega tu primer producto.
        </Text>
        <Button title="Volver" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView className="flex-1 p-4">
        <Text variant="h1" className="mb-6 text-success">Entrada</Text>

        <Card className="mb-6">
          <Text variant="caption" className="font-medium mb-1 ml-1 text-text-secondary">Producto</Text>
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            className="bg-surface border border-border rounded-xl py-3.5 px-4 mb-4"
          >
            <Text className={selectedProduct ? 'text-text font-medium' : 'text-text-secondary'}>
              {selectedProduct ? `${selectedProduct.name} (Stock: ${selectedProduct.stockQuantity})` : 'Seleccionar...'}
            </Text>
          </TouchableOpacity>

          <TextInput 
            label="Cantidad" 
            value={quantity} 
            onChangeText={setQuantity} 
            keyboardType="numeric" 
            placeholder="Ej. 10"
          />

          <TextInput 
            label="Nota (Opcional)" 
            value={note} 
            onChangeText={setNote} 
            placeholder="Ej. Compra a proveedor"
          />
        </Card>

        <View className="flex-row gap-4 mb-8">
          <Button title="Cancelar" variant="outline" onPress={() => router.back()} className="flex-1" />
          <Button title="Guardar" variant="primary" loading={loading} onPress={handleConfirm} className="flex-1 bg-success border-success" />
        </View>
      </ScrollView>

      {/* Product Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Screen className="p-4">
          <View className="flex-row justify-between items-center mb-4 mt-2">
            <Text variant="h2">Seleccionar Producto</Text>
            <Button title="Cerrar" variant="outline" onPress={() => setModalVisible(false)} className="py-1 px-3" />
          </View>
          
          <TextInput 
            placeholder="Buscar producto..." 
            value={search} 
            onChangeText={setSearch} 
          />

          <ScrollView className="flex-1 mt-2">
            {filteredProducts.map(p => (
              <TouchableOpacity 
                key={p.id}
                onPress={() => {
                  setProductId(p.id);
                  setModalVisible(false);
                }}
                className="py-3 border-b border-border"
              >
                <Text className="font-bold">{p.name}</Text>
                <Text variant="caption" color="secondary">Stock actual: {p.stockQuantity} | SKU: {p.sku || '-'}</Text>
              </TouchableOpacity>
            ))}
            {filteredProducts.length === 0 && (
              <Text className="text-center mt-4" color="secondary">No se encontraron productos</Text>
            )}
          </ScrollView>
        </Screen>
      </Modal>
    </Screen>
  );
}
