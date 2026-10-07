import { useState, useEffect } from 'react';
import { ScrollView, View, Alert, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
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
  const [imageUrl, setImageUrl] = useState('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const product = products.find(p => p.id === id);
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(product.name);
      setSku(product.sku || '');
      setCategoryId(product.categoryId || '');
      setBasePrice(product.basePrice.toString());
      setStockQuantity(product.stockQuantity.toString());
      setImageUrl(product.imageUrl || '');
      setDynamicValues(product.dynamicAttributes || {});
    }
  }, [id, products]);

  if (!profile) return null;

  const product = products.find(p => p.id === id);
  if (!product) {
    return (
      <Screen className="items-center justify-center bg-background">
        <Text>Producto no encontrado.</Text>
        <Button title="Volver" onPress={() => router.back()} className="mt-4" />
      </Screen>
    );
  }

  const handleDynamicChange = (attrId: string, value: string) => {
    setDynamicValues(prev => ({ ...prev, [attrId]: value }));
    setErrors(prev => ({ ...prev, [attrId]: '' }));
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
      const updatedProduct: Product = {
        ...product,
        name: name.trim(),
        sku: profile.useProductCodes ? sku.trim() : undefined,
        categoryId: profile.useCategories ? categoryId.trim() : undefined,
        basePrice: parseFloat(basePrice.replace(',', '.')),
        stockQuantity: parseFloat(stockQuantity.replace(',', '.')),
        imageUrl: imageUrl || undefined,
        dynamicAttributes: dynamicValues,
      };

      await saveProduct(updatedProduct);
      Alert.alert('Éxito', 'Producto actualizado.');
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('¿Eliminar este producto?', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await deleteProduct(product.id);
            Alert.alert('Éxito', 'Producto eliminado.');
            router.replace('/products' as any);
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el producto.');
          }
      }}
    ]);
  };

  if (!isEditing) {
    return (
      <Screen className="bg-background">
        {/* Header */}
        <View className="px-4 pt-4 pb-2 flex-row items-center justify-between border-b border-border/50">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
            <SymbolView name="chevron.left" size={24} tintColor="rgb(var(--color-text))" />
          </TouchableOpacity>
          <Text variant="h2" className="text-xl text-text font-bold" numberOfLines={1}>{product.name}</Text>
          <TouchableOpacity onPress={() => setIsEditing(true)} className="w-10 h-10 items-center justify-center bg-primary/10 rounded-full">
            <SymbolView name="pencil" size={20} tintColor="rgb(var(--color-primary))" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Image */}
          <View className="items-center mb-8">
            <View className="w-32 h-32 rounded-3xl bg-surface-variant border border-border shadow-sm items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <SymbolView name="cube.box" size={40} tintColor="rgb(var(--color-disabled))" />
              )}
            </View>
          </View>

          <View className="bg-surface rounded-[24px] p-5 border border-border shadow-sm mb-6">
            <Text variant="h3" className="mb-4">Detalles Básicos</Text>
            <View className="flex-row justify-between border-b border-border/50 py-3">
              <Text color="secondary">Precio Base</Text>
              <Text className="font-bold text-lg">${product.basePrice.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between border-b border-border/50 py-3">
              <Text color="secondary">Stock</Text>
              <Text className="font-bold text-lg">{product.stockQuantity} {profile.defaultUnit}</Text>
            </View>
            {product.sku && (
              <View className="flex-row justify-between border-b border-border/50 py-3">
                <Text color="secondary">Código</Text>
                <Text className="font-medium text-text">{product.sku}</Text>
              </View>
            )}
            {product.categoryId && (
              <View className="flex-row justify-between py-3">
                <Text color="secondary">Categoría</Text>
                <Text className="font-medium text-text">{product.categoryId}</Text>
              </View>
            )}
          </View>

          {attributes.length > 0 && (
            <View className="bg-surface rounded-[24px] p-5 border border-border shadow-sm mb-6">
              <Text variant="h3" className="mb-4">Características ({profile.productType})</Text>
              {attributes.map(attr => (
                <View key={attr.id} className="flex-row justify-between border-b border-border/50 py-3 last:border-0">
                  <Text color="secondary">{attr.name}</Text>
                  <Text className="font-medium text-text">{product.dynamicAttributes[attr.id] || '-'}</Text>
                </View>
              ))}
            </View>
          )}

          <Button title="Eliminar Producto" variant="outline" className="border-error text-error" onPress={handleDelete} />
        </ScrollView>
      </Screen>
    );
  }

  // Edit Mode
  return (
    <Screen className="bg-background">
      {/* Header Edit */}
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between border-b border-border/50">
        <TouchableOpacity onPress={() => setIsEditing(false)} className="w-10 h-10 items-center justify-center -ml-2">
          <SymbolView name="xmark" size={20} tintColor="rgb(var(--color-text))" />
        </TouchableOpacity>
        <Text variant="h2" className="text-xl text-text font-bold">Editar producto</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Image Edit */}
        <View className="items-center mb-8">
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                'Seleccionar imagen',
                'Elige una opción',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Cámara', onPress: () => setImageUrl('https://placehold.co/400x400/eeeeee/999999.png?text=Foto+Simulada') },
                  { text: 'Galería', onPress: () => setImageUrl('https://placehold.co/400x400/eeeeee/999999.png?text=Imagen+Simulada') },
                ]
              );
            }}
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

        {/* Form Fields */}
        <View className="bg-surface rounded-[24px] p-5 border border-border shadow-sm mb-6">
          <Text variant="h3" className="mb-4">Información Básica</Text>
          <TextInput 
            label="Nombre del Producto *" 
            value={name} 
            onChangeText={(t) => { setName(t); setErrors(prev => ({ ...prev, name: '' })); }} 
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
              icon="dollarsign"
              maxLength={ValidationRules.PRICE_MAX}
              className="flex-1" 
              error={errors.basePrice}
            />
            <TextInput 
              label={`Stock (${profile.defaultUnit}) *`} 
              value={stockQuantity} 
              onChangeText={(t) => { setStockQuantity(sanitizeNumericInput(t)); setErrors(prev => ({ ...prev, stockQuantity: '' })); }} 
              keyboardType="numeric" 
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
              maxLength={ValidationRules.CATEGORY_MAX}
            />
          )}
          {profile.useProductCodes && (
            <TextInput 
              label="Código / SKU" 
              value={sku} 
              onChangeText={setSku} 
              maxLength={ValidationRules.PRODUCT_CODE_MAX}
            />
          )}
        </View>

        {attributes.length > 0 && (
          <View className="bg-surface rounded-[24px] p-5 border border-border shadow-sm mb-6">
            <Text variant="h3" className="mb-4">Características</Text>
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
                  value={dynamicValues[attr.id]?.toString() || ''}
                  onChangeText={(val) => {
                    const s = attr.dataType === 'number' ? sanitizeNumericInput(val) : val;
                    handleDynamicChange(attr.id, s);
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

      {/* Footer Action */}
      <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border p-4 pb-8 flex-row gap-4 shadow-sm">
        <Button title="Guardar" variant="primary" loading={loading} onPress={handleSave} className="flex-1 py-4 rounded-xl" />
      </View>
    </Screen>
  );
}
