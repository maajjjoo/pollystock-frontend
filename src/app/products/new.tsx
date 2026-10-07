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
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!profile) {
    return (
      <Screen className="p-6 justify-center items-center bg-background">
        <Text>Falta configuración del negocio.</Text>
      </Screen>
    );
  }

  const handleDynamicChange = (id: string, value: string) => {
    setDynamicValues(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const handlePickImage = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cámara', onPress: () => setImageUrl('https://placehold.co/400x400/eeeeee/999999.png?text=Foto+Simulada') },
        { text: 'Galería', onPress: () => setImageUrl('https://placehold.co/400x400/eeeeee/999999.png?text=Imagen+Simulada') },
      ]
    );
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Este campo es obligatorio.';

    const priceError = validatePositiveNumber(basePrice);
    if (priceError) newErrors.basePrice = priceError;

    const stockError = validatePositiveNumber(stockQuantity);
    if (stockError) newErrors.stockQuantity = stockError;

    for (const attr of attributes) {
      const val = dynamicValues[attr.id];
      if (attr.isRequired && (!val || val.toString().trim() === '')) {
        newErrors[attr.id] = 'Este campo es obligatorio.';
      } else if (val && val.toString().trim() !== '' && attr.dataType === 'number') {
        const err = validatePositiveNumber(val.toString());
        if (err) newErrors[attr.id] = err;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
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
      Alert.alert('Éxito', 'Producto agregado.');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar el producto.');
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
        <Text variant="h2" >Añadir producto</Text>
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
            onChangeText={(t) => { setName(t); setErrors(prev => ({ ...prev, name: '' })); }} 
            placeholder="Ej. Camiseta Básica" 
            maxLength={ValidationRules.PRODUCT_NAME_MAX}
            error={errors.name}
            showCharCount
          />
          
          <View className="flex-row gap-4">
            <TextInput 
              label="Precio *" 
              value={basePrice} 
              onChangeText={(t) => { setBasePrice(sanitizeNumericInput(t)); setErrors(prev => ({ ...prev, basePrice: '' })); }} 
              keyboardType="numeric" 
              placeholder="0.00"
              icon="dollarsign"
              maxLength={ValidationRules.PRICE_MAX}
              className="flex-1"
              error={errors.basePrice}
            />
            <TextInput 
              label={`Cantidad (${profile.defaultUnit}) *`} 
              value={stockQuantity} 
              onChangeText={(t) => { setStockQuantity(sanitizeNumericInput(t)); setErrors(prev => ({ ...prev, stockQuantity: '' })); }} 
              keyboardType="numeric" 
              placeholder="0"
              maxLength={ValidationRules.QUANTITY_MAX}
              className="flex-1"
              error={errors.stockQuantity}
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
                  error={errors[attr.id]}
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
