import { useState, useEffect } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';
import { useProductStore } from '@/features/products/hooks/use-product-store';
import { Product } from '@/core/database/schema';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, attributes } = useConfigStore();
  const { products, saveProduct, deleteProduct } = useProductStore();

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  useEffect(() => {
    const product = products.find(p => p.id === id);
    if (product) {
      setName(product.name);
      setSku(product.sku || '');
      setCategoryId(product.categoryId || '');
      setBasePrice(product.basePrice.toString());
      setStockQuantity(product.stockQuantity.toString());
      setDynamicValues(product.dynamicAttributes || {});
    }
  }, [id, products]);

  if (!profile) return null;

  const product = products.find(p => p.id === id);
  if (!product) {
    return (
      <Screen className="items-center justify-center">
        <Text>Producto no encontrado.</Text>
        <Button title="Volver" onPress={() => router.back()} className="mt-4" />
      </Screen>
    );
  }

  const handleDynamicChange = (attrId: string, value: string) => {
    setDynamicValues(prev => ({ ...prev, [attrId]: value }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio'); return;
    }
    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) {
      Alert.alert('Error', 'Precio inválido'); return;
    }
    const stock = parseFloat(stockQuantity);
    if (isNaN(stock) || stock < 0) {
      Alert.alert('Error', 'Stock inválido'); return;
    }

    for (const attr of attributes) {
      const val = dynamicValues[attr.id];
      if (attr.isRequired && (!val || val.toString().trim() === '')) {
        Alert.alert('Error', `El atributo "${attr.name}" es obligatorio`); return;
      }
      if (val && val.toString().trim() !== '' && attr.dataType === 'number' && isNaN(Number(val))) {
        Alert.alert('Error', `El atributo "${attr.name}" debe ser numérico`); return;
      }
    }

    setLoading(true);
    try {
      const updatedProduct: Product = {
        ...product,
        name: name.trim(),
        sku: profile.useProductCodes ? sku.trim() : undefined,
        categoryId: profile.useCategories ? categoryId.trim() : undefined,
        basePrice: price,
        stockQuantity: stock,
        dynamicAttributes: dynamicValues,
      };

      await saveProduct(updatedProduct);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirmar eliminación', '¿Estás seguro de que deseas eliminar este producto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await deleteProduct(product.id);
            router.back();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el producto');
          }
      }}
    ]);
  };

  if (!isEditing) {
    return (
      <Screen>
        <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="flex-row justify-between items-center mb-6">
            <Text variant="h1" className="flex-1 mr-4">{product.name}</Text>
            <Button title="Editar" variant="outline" onPress={() => setIsEditing(true)} />
          </View>

          <Card className="mb-6">
            <Text variant="h3" className="mb-4">Detalles Generales</Text>
            <View className="flex-row justify-between border-b border-border py-2">
              <Text color="secondary">Precio Base</Text>
              <Text className="font-bold">${product.basePrice.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between border-b border-border py-2">
              <Text color="secondary">Stock Disponible</Text>
              <Text className="font-bold">{product.stockQuantity} {profile.defaultUnit}</Text>
            </View>
            {product.sku && (
              <View className="flex-row justify-between border-b border-border py-2">
                <Text color="secondary">SKU / Código</Text>
                <Text>{product.sku}</Text>
              </View>
            )}
            {product.categoryId && (
              <View className="flex-row justify-between py-2">
                <Text color="secondary">Categoría</Text>
                <Text>{product.categoryId}</Text>
              </View>
            )}
          </Card>

          {attributes.length > 0 && (
            <Card className="mb-6">
              <Text variant="h3" className="mb-4">Características ({profile.productType})</Text>
              {attributes.map(attr => (
                <View key={attr.id} className="flex-row justify-between border-b border-border py-2 last:border-0">
                  <Text color="secondary">{attr.name}</Text>
                  <Text>{product.dynamicAttributes[attr.id] || '-'}</Text>
                </View>
              ))}
            </Card>
          )}

          <View className="flex-row gap-4 mb-6">
            <Button 
              title="+ Entrada" 
              variant="outline" 
              className="flex-1 border-success" 
              onPress={() => router.push({ pathname: '/movements/entry', params: { productId: product.id } } as any)} 
            />
            <Button 
              title="- Salida" 
              variant="outline" 
              className="flex-1 border-warning" 
              onPress={() => router.push({ pathname: '/movements/exit', params: { productId: product.id } } as any)} 
            />
          </View>

          <Button title="Eliminar Producto" variant="destructive" onPress={handleDelete} />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="h1" className="mb-6">Editar Producto</Text>

        <Card className="mb-6">
          <Text variant="h3" className="mb-4">Información Básica</Text>
          <TextInput label="Nombre del Producto *" value={name} onChangeText={setName} />
          {profile.useProductCodes && <TextInput label="Código / SKU" value={sku} onChangeText={setSku} />}
          {profile.useCategories && <TextInput label="Categoría" value={categoryId} onChangeText={setCategoryId} />}
          <View className="flex-row gap-4">
            <TextInput label="Precio Base *" value={basePrice} onChangeText={setBasePrice} keyboardType="numeric" className="flex-1" />
            <TextInput label={`Stock Inicial (${profile.defaultUnit}) *`} value={stockQuantity} onChangeText={setStockQuantity} keyboardType="numeric" className="flex-1" />
          </View>
        </Card>

        {attributes.length > 0 && (
          <Card className="mb-6">
            <Text variant="h3" className="mb-4">Características</Text>
            {attributes.map(attr => (
              <TextInput 
                key={attr.id}
                label={`${attr.name} ${attr.isRequired ? '*' : ''}`}
                value={dynamicValues[attr.id]?.toString() || ''}
                onChangeText={(val) => handleDynamicChange(attr.id, val)}
                keyboardType={attr.dataType === 'number' ? 'numeric' : 'default'}
              />
            ))}
          </Card>
        )}

        <View className="flex-row gap-4 mb-8">
          <Button title="Cancelar" variant="outline" onPress={() => setIsEditing(false)} className="flex-1" />
          <Button title="Guardar" variant="primary" loading={loading} onPress={handleSave} className="flex-1" />
        </View>
      </ScrollView>
    </Screen>
  );
}
