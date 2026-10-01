import { useState } from 'react';
import { ScrollView, View, Alert, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';
import { useProductStore } from '@/features/products/hooks/use-product-store';
import { Product } from '@/core/database/schema';
import { ValidationRules, validatePositiveNumber, sanitizeNumericInput } from '@/utils/validation';

export default function NewProductScreen() {
  const { profile, attributes } = useConfigStore();
  const { saveProduct } = useProductStore();

  const [loading, setLoading] = useState(false);

  // Base fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Dynamic attributes
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  if (!profile) {
    return (
      <Screen className="p-6 justify-center items-center bg-background">
        <Text>Falta configuración del negocio.</Text>
      </Screen>
    );
  }

  const handleDynamicChange = (id: string, value: string) => {
    setDynamicValues(prev => ({ ...prev, [id]: value }));
  };

  const handlePickImage = () => {
    // Mock image picker
    setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Este campo es obligatorio: Nombre');
      return;
    }

    const priceError = validatePositiveNumber(basePrice);
    if (priceError) {
      Alert.alert('Error', priceError);
      return;
    }

    const stockError = validatePositiveNumber(stockQuantity);
    if (stockError) {
      Alert.alert('Error', stockError);
      return;
    }

    for (const attr of attributes) {
      const val = dynamicValues[attr.id];
      if (attr.isRequired && (!val || val.toString().trim() === '')) {
        Alert.alert('Error', `Este campo es obligatorio: ${attr.name}`);
        return;
      }
      if (val && val.toString().trim() !== '' && attr.dataType === 'number') {
        const error = validatePositiveNumber(val.toString());
        if (error) {
          Alert.alert('Error', `${attr.name}: ${error}`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: name.trim(),
        sku: profile.useProductCodes ? sku.trim() : undefined,
        categoryId: profile.useCategories ? categoryId.trim() : undefined,
        basePrice: parseFloat(basePrice.replace(',', '.')),
        stockQuantity: parseFloat(stockQuantity.replace(',', '.')),
        imageUrl: imageUrl || undefined,
        dynamicAttributes: dynamicValues,
      };

      await saveProduct(newProduct);
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen className="bg-background">
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between border-b border-border/50">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <SymbolView name="chevron.left" size={24} tintColor="rgb(var(--color-text))" />
        </TouchableOpacity>
        <Text variant="h2" className="text-xl text-text font-bold">Añadir producto</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
        
        <View className="items-center mb-8">
          <TouchableOpacity 
            onPress={handlePickImage}
            className="w-32 h-32 rounded-3xl bg-surface border border-border shadow-sm items-center justify-center overflow-hidden active:opacity-80"
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center justify-center">
                <SymbolView name="camera.fill" size={32} tintColor="rgb(var(--color-disabled))" style={{ marginBottom: 8 }} />
                <Text variant="caption" color="secondary" className="font-medium text-center px-2">Agregar{'\n'}imagen</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUrl && (
            <TouchableOpacity onPress={() => setImageUrl('')} className="mt-3 bg-surface-variant px-4 py-1.5 rounded-full border border-border">
              <Text variant="caption" className="font-medium text-text-secondary">Quitar imagen</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="bg-surface rounded-[24px] p-5 border border-border shadow-sm mb-6">
          <Text variant="h3" className="mb-4">Datos básicos</Text>
          <TextInput 
            label="Nombre del producto *" 
            value={name} 
            onChangeText={setName} 
            placeholder="Ej. Camiseta Básica" 
            maxLength={ValidationRules.PRODUCT_NAME_MAX}
          />
          
          <View className="flex-row gap-4">
            <TextInput 
              label="Precio *" 
              value={basePrice} 
              onChangeText={(text) => setBasePrice(sanitizeNumericInput(text))} 
              keyboardType="numeric" 
              placeholder="0.00"
              icon="dollarsign"
              className="flex-1"
            />
            <TextInput 
              label={`Cantidad (${profile.defaultUnit}) *`} 
              value={stockQuantity} 
              onChangeText={(text) => setStockQuantity(sanitizeNumericInput(text))} 
              keyboardType="numeric" 
              placeholder="0"
              className="flex-1"
            />
          </View>

          {profile.useCategories && (
            <TextInput 
              label="Categoría" 
              value={categoryId} 
              onChangeText={setCategoryId} 
              placeholder="Ej. Ropa" 
              maxLength={ValidationRules.CATEGORY_MAX}
            />
          )}

          {profile.useProductCodes && (
            <TextInput 
              label="Código / Referencia" 
              value={sku} 
              onChangeText={setSku} 
              placeholder="Ej. REF-001" 
              maxLength={ValidationRules.PRODUCT_CODE_MAX}
            />
          )}
        </View>

        {attributes.length > 0 && (
          <View className="bg-surface rounded-[24px] p-5 border border-border shadow-sm mb-6">
            <Text variant="h3" className="mb-4">Detalles extra</Text>
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
                  onChangeText={(val) => {
                    const sanitized = attr.dataType === 'number' ? sanitizeNumericInput(val) : val;
                    handleDynamicChange(attr.id, sanitized);
                  }}
                  keyboardType={attr.dataType === 'number' ? 'numeric' : 'default'}
                  maxLength={ValidationRules.CUSTOM_OPTION_MAX}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border p-4 pb-8 shadow-sm">
        <Button title="Guardar producto" variant="primary" loading={loading} onPress={handleSave} className="py-4 rounded-xl" />
      </View>
    </Screen>
  );
}
