import { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { BusinessProfile, AttributeDefinition, DataType } from '@/core/database/schema';
import { saveBusinessProfile, saveAttributeDefinitions } from '@/core/database/db';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';

export default function SetupScreen() {
  const { setProfile, setAttributes } = useConfigStore();
  const [loading, setLoading] = useState(false);

  // General Settings
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [productType, setProductType] = useState('');
  const [defaultUnit, setDefaultUnit] = useState('Unidad');

  // Modules
  const [useCategories, setUseCategories] = useState(true);
  const [useProductCodes, setUseProductCodes] = useState(true);
  const [useMinStock, setUseMinStock] = useState(false);
  const [useExpirationDates, setUseExpirationDates] = useState(false);

  // Dynamic Attributes
  const [attributes, setLocalAttributes] = useState<AttributeDefinition[]>([]);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrType, setNewAttrType] = useState<DataType>('text');
  const [newAttrRequired, setNewAttrRequired] = useState(false);

  const handleAddAttribute = () => {
    if (!newAttrName.trim()) {
      Alert.alert('Error', 'Ingresa un nombre.');
      return;
    }
    if (attributes.some(a => a.name.toLowerCase() === newAttrName.trim().toLowerCase())) {
      Alert.alert('Error', 'Esta característica ya existe.');
      return;
    }

    const newAttr: AttributeDefinition = {
      id: Date.now().toString(),
      name: newAttrName.trim(),
      dataType: newAttrType,
      isRequired: newAttrRequired,
    };

    setLocalAttributes([...attributes, newAttr]);
    setNewAttrName('');
    setNewAttrRequired(false);
  };

  const handleRemoveAttribute = (id: string) => {
    setLocalAttributes(attributes.filter(a => a.id !== id));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Ingresa un nombre.');
      return;
    }
    if (!businessType.trim() || !productType.trim()) {
      Alert.alert('Error', 'Completa los campos sobre tu negocio.');
      return;
    }

    setLoading(true);
    try {
      const profile: BusinessProfile = {
        id: '1',
        name: name.trim(),
        businessType: businessType.trim(),
        productType: productType.trim(),
        defaultUnit: defaultUnit.trim(),
        useCategories,
        useProductCodes,
        useMinStock,
        useExpirationDates,
      };

      await saveBusinessProfile(profile);
      await saveAttributeDefinitions(attributes);

      setProfile(profile);
      setAttributes(attributes);

      router.replace('/');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="h1" className="mb-2">Bienvenido</Text>
        <Text variant="body" color="secondary" className="mb-6">
          Configura cómo funcionará tu inventario.
        </Text>

        <Card className="mb-6">
          <Text variant="h2" className="mb-4">Sobre tu negocio</Text>
          <TextInput label="Nombre del negocio" value={name} onChangeText={setName} placeholder="Ej. Mi Tienda" />
          
          <Select 
            label="Tipo de negocio" 
            selectedValue={businessType} 
            onSelect={setBusinessType} 
            placeholder="Selecciona una opción..."
            options={[
              { label: 'Ropa y Accesorios', value: 'Ropa y Accesorios' },
              { label: 'Alimentos y Bebidas', value: 'Alimentos y Bebidas' },
              { label: 'Tecnología', value: 'Tecnología' },
              { label: 'Hogar', value: 'Hogar' },
              { label: 'Salud y Belleza', value: 'Salud y Belleza' },
              { label: 'Otro', value: 'Otro' }
            ]} 
          />

          <TextInput label="¿Qué vendes? (Ej: Remeras, Cables)" value={productType} onChangeText={setProductType} placeholder="Ej. Remeras" />
          
          <Select 
            label="Unidad principal" 
            selectedValue={defaultUnit} 
            onSelect={setDefaultUnit} 
            placeholder="Selecciona una unidad..."
            options={[
              { label: 'Unidad', value: 'Unidad' },
              { label: 'Kilogramo (kg)', value: 'kg' },
              { label: 'Gramo (g)', value: 'g' },
              { label: 'Litro (L)', value: 'L' },
              { label: 'Mililitro (ml)', value: 'ml' },
              { label: 'Metro (m)', value: 'm' }
            ]} 
          />
        </Card>

        <Card className="mb-6">
          <Text variant="h2" className="mb-4">Reglas del inventario</Text>
          <Switch label="Usar categorías" value={useCategories} onValueChange={setUseCategories} />
          <Switch label="Usar código o SKU" value={useProductCodes} onValueChange={setUseProductCodes} />
          <Switch label="Alertas de stock mínimo" value={useMinStock} onValueChange={setUseMinStock} />
          <Switch label="Fechas de vencimiento" value={useExpirationDates} onValueChange={setUseExpirationDates} />
        </Card>

        <Card className="mb-6">
          <Text variant="h2" className="mb-2">Características extra</Text>
          <Text variant="caption" color="secondary" className="mb-4">
            Añade campos como Talla, Color o Marca.
          </Text>

          {attributes.map(attr => (
            <View key={attr.id} className="flex-row items-center justify-between bg-surface-variant p-3 rounded-xl mb-2 border border-border">
              <View>
                <Text className="font-medium">{attr.name} {attr.isRequired ? '*' : ''}</Text>
                <Text variant="caption" color="secondary">{attr.dataType === 'text' ? 'Texto' : attr.dataType === 'number' ? 'Número' : attr.dataType === 'boolean' ? 'Sí / No' : 'Fecha'}</Text>
              </View>
              <Button title="Quitar" variant="outline" onPress={() => handleRemoveAttribute(attr.id)} className="py-1 px-3 border-error" />
            </View>
          ))}

          <View className="mt-4 p-4 bg-background rounded-xl border border-border">
            <Text className="font-semibold mb-3 text-lg">Nueva característica</Text>
            <TextInput label="Nombre (Ej: Color)" value={newAttrName} onChangeText={setNewAttrName} placeholder="Color" />
            
            <Select 
              label="Tipo de respuesta" 
              selectedValue={newAttrType} 
              onSelect={(val) => setNewAttrType(val as DataType)} 
              options={[
                { label: 'Texto', value: 'text' },
                { label: 'Número', value: 'number' },
                { label: 'Sí / No', value: 'boolean' },
                { label: 'Fecha', value: 'date' }
              ]} 
            />

            <Switch label="Es obligatorio" value={newAttrRequired} onValueChange={setNewAttrRequired} className="mb-4" />
            <Button title="Agregar" variant="secondary" onPress={handleAddAttribute} />
          </View>
        </Card>

        <Button title="Guardar" variant="primary" loading={loading} onPress={handleSave} className="mb-8" />
      </ScrollView>
    </Screen>
  );
}
