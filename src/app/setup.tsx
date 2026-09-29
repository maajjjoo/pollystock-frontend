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
      Alert.alert('Error', 'El nombre del atributo no puede estar vacío');
      return;
    }
    if (attributes.some(a => a.name.toLowerCase() === newAttrName.trim().toLowerCase())) {
      Alert.alert('Error', 'Ya existe un atributo con ese nombre');
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
      Alert.alert('Validación', 'El nombre del negocio es obligatorio');
      return;
    }
    if (!businessType.trim() || !productType.trim()) {
      Alert.alert('Validación', 'Debe especificar el tipo de negocio y productos');
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
        <Text variant="h1" className="mb-2">Configuración Inicial</Text>
        <Text variant="body" color="secondary" className="mb-6">
          Personaliza el inventario para adaptarlo a tu negocio.
        </Text>

        <Card className="mb-6">
          <Text variant="h3" className="mb-4">1. Perfil del Negocio</Text>
          <TextInput label="Nombre del Negocio / Inventario" value={name} onChangeText={setName} placeholder="Ej. Mi Tienda" />
          
          <Select 
            label="Categoría de tu Negocio" 
            selectedValue={businessType} 
            onSelect={setBusinessType} 
            placeholder="Selecciona el giro de tu negocio..."
            options={[
              { label: 'Indumentaria y Moda', value: 'Indumentaria y Moda' },
              { label: 'Alimentos y Bebidas', value: 'Alimentos y Bebidas' },
              { label: 'Tecnología y Electrónica', value: 'Tecnología y Electrónica' },
              { label: 'Hogar y Muebles', value: 'Hogar y Muebles' },
              { label: 'Salud y Belleza', value: 'Salud y Belleza' },
              { label: 'Papelería y Oficina', value: 'Papelería y Oficina' },
              { label: 'Repuestos y Ferretería', value: 'Repuestos y Ferretería' },
              { label: 'Otro', value: 'Otro' }
            ]} 
          />

          <TextInput label="¿Qué productos vendes? (Ej. Remeras, Tartas, Cables)" value={productType} onChangeText={setProductType} placeholder="Ej. Indumentaria" />
          <TextInput label="¿Cómo se miden tus productos? (Unidad por defecto)" value={defaultUnit} onChangeText={setDefaultUnit} placeholder="Ej. Unidad, Kg, Litros" />
        </Card>

        <Card className="mb-6">
          <Text variant="h3" className="mb-4">2. Reglas del Inventario</Text>
          <Switch label="Usar Categorías" description="Agrupar productos en categorías" value={useCategories} onValueChange={setUseCategories} />
          <Switch label="Usar Códigos de Producto" description="SKU o Código de barras" value={useProductCodes} onValueChange={setUseProductCodes} />
          <Switch label="Control de Stock Mínimo" description="Alertas cuando quede poco stock" value={useMinStock} onValueChange={setUseMinStock} />
          <Switch label="Fechas de Vencimiento" description="Ideal para alimentos o medicinas" value={useExpirationDates} onValueChange={setUseExpirationDates} />
        </Card>

        <Card className="mb-6">
          <Text variant="h3" className="mb-2">3. Atributos Dinámicos</Text>
          <Text variant="caption" color="secondary" className="mb-4">
            Añade campos específicos para tus productos (ej. Talla, Color, Marca).
          </Text>

          {attributes.map(attr => (
            <View key={attr.id} className="flex-row items-center justify-between bg-background p-3 rounded-md mb-2 border border-border">
              <View>
                <Text className="font-medium">{attr.name} {attr.isRequired ? '*' : ''}</Text>
                <Text variant="caption" color="secondary">Tipo: {attr.dataType}</Text>
              </View>
              <Button title="Eliminar" variant="outline" onPress={() => handleRemoveAttribute(attr.id)} className="py-1 px-2" />
            </View>
          ))}

          <View className="mt-4 p-4 bg-background rounded-md border border-border">
            <Text className="font-medium mb-3">Nuevo Atributo</Text>
            <TextInput label="Nombre" value={newAttrName} onChangeText={setNewAttrName} placeholder="Ej. Talla" />
            
            <Select 
              label="Tipo de Información" 
              selectedValue={newAttrType} 
              onSelect={(val) => setNewAttrType(val as DataType)} 
              options={[
                { label: 'Texto Corto (Ej: Color, Marca)', value: 'text' },
                { label: 'Número (Ej: Peso, Capacidad)', value: 'number' },
                { label: 'Sí / No (Ej: ¿Es importado?)', value: 'boolean' },
                { label: 'Fecha (Ej: Elaboración)', value: 'date' }
              ]} 
            />

            <Switch label="¿Es un campo obligatorio?" value={newAttrRequired} onValueChange={setNewAttrRequired} className="border-b-0 mb-4" />
            <Button title="Añadir Atributo" variant="secondary" onPress={handleAddAttribute} />
          </View>
        </Card>

        <Button title="Guardar Configuración" variant="primary" loading={loading} onPress={handleSave} className="mb-8" />
      </ScrollView>
    </Screen>
  );
}
