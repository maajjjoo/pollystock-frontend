import { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';
import { useProductStore } from '@/features/products/hooks/use-product-store';
import { Product } from '@/core/database/schema';

export default function NewProductScreen() {
  const { profile, attributes } = useConfigStore();
  const { saveProduct } = useProductStore();

  const [loading, setLoading] = useState(false);

  // Base fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState(''); // Simple text for now
  const [basePrice, setBasePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  // Dynamic attributes
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  if (!profile) {
    return (
      <Screen className="p-6 justify-center items-center">
        <Text>Falta configuración del negocio.</Text>
      </Screen>
    );
  }

  const handleDynamicChange = (id: string, value: string) => {
    setDynamicValues(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }

    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) {
      Alert.alert('Error', 'El precio debe ser un número válido mayor o igual a 0');
      return;
    }

    const stock = parseFloat(stockQuantity);
    if (isNaN(stock) || stock < 0) {
      Alert.alert('Error', 'El stock inicial debe ser un número válido mayor o igual a 0');
      return;
    }

    // Dynamic attributes validation
    for (const attr of attributes) {
      const val = dynamicValues[attr.id];
      if (attr.isRequired && (!val || val.toString().trim() === '')) {
        Alert.alert('Error', `El atributo "${attr.name}" es obligatorio`);
        return;
      }
      
      // Type validation
      if (val && val.toString().trim() !== '') {
        if (attr.dataType === 'number') {
          if (isNaN(Number(val))) {
            Alert.alert('Error', `El atributo "${attr.name}" debe ser numérico`);
            return;
          }
        }
      }
    }

    setLoading(true);
    try {
      const newProduct: Product = {
        id: Date.now().toString(), // simple id generator
        name: name.trim(),
        sku: profile.useProductCodes ? sku.trim() : undefined,
        categoryId: profile.useCategories ? categoryId.trim() : undefined,
        basePrice: price,
        stockQuantity: stock,
        dynamicAttributes: dynamicValues,
      };

      await saveProduct(newProduct);
      Alert.alert('Éxito', 'Producto registrado correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="h1" className="mb-6">Nuevo Producto</Text>

        <Card className="mb-6">
          <Text variant="h3" className="mb-4">Información Básica</Text>
          <TextInput label="Nombre del Producto *" value={name} onChangeText={setName} />
          
          {profile.useProductCodes && (
            <TextInput label="Código / SKU" value={sku} onChangeText={setSku} />
          )}

          {profile.useCategories && (
            <TextInput label="Categoría" value={categoryId} onChangeText={setCategoryId} placeholder="Ej. Remeras" />
          )}

          <View className="flex-row gap-4">
            <TextInput 
              label="Precio Base *" 
              value={basePrice} 
              onChangeText={setBasePrice} 
              keyboardType="numeric" 
              className="flex-1"
            />
            <TextInput 
              label={`Stock Inicial (${profile.defaultUnit}) *`} 
              value={stockQuantity} 
              onChangeText={setStockQuantity} 
              keyboardType="numeric" 
              className="flex-1"
            />
          </View>
        </Card>

        {attributes.length > 0 && (
          <Card className="mb-6">
            <Text variant="h3" className="mb-4">Características ({profile.productType})</Text>
            {attributes.map(attr => {
              if (attr.dataType === 'boolean') {
                return (
                  <Switch
                    key={attr.id}
                    label={`${attr.name} ${attr.isRequired ? '*' : ''}`}
                    value={dynamicValues[attr.id] === 'true' || dynamicValues[attr.id] === true}
                    onValueChange={(val) => handleDynamicChange(attr.id, val.toString())}
                  />
                );
              }
              
              return (
                <TextInput 
                  key={attr.id}
                  label={`${attr.name} ${attr.isRequired ? '*' : ''}`}
                  value={dynamicValues[attr.id] || ''}
                  onChangeText={(val) => handleDynamicChange(attr.id, val)}
                  keyboardType={attr.dataType === 'number' ? 'numeric' : 'default'}
                />
              );
            })}
          </Card>
        )}

        <Button title="Registrar Producto" variant="primary" loading={loading} onPress={handleSave} className="mb-8" />
      </ScrollView>
    </Screen>
  );
}
