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

  const [step, setStep] = useState(0);
  const totalSteps = 4;

  const nextStep = () => {
    if (step === 0 && !name.trim()) {
      Alert.alert('Error', 'Ingresa el nombre de tu negocio.');
      return;
    }
    if (step === 0 && !businessType.trim()) {
      Alert.alert('Error', 'Selecciona el tipo de negocio.');
      return;
    }
    if (step === 1 && !productType.trim()) {
      Alert.alert('Error', 'Escribe qué productos vendes.');
      return;
    }
    setStep(s => Math.min(s + 1, totalSteps - 1));
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 0));
  };

  return (
    <Screen>
      <View className="px-4 pt-4 pb-2">
        {/* Progress indicator */}
        <View className="flex-row items-center justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <View 
              key={idx} 
              className={`h-1.5 flex-1 rounded-full mx-1 ${idx <= step ? 'bg-primary' : 'bg-disabled-bg'}`} 
            />
          ))}
        </View>
        <Text variant="caption" color="secondary" className="text-center font-medium">Paso {step + 1} de {totalSteps}</Text>
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {step === 0 && (
          <View>
            <Text variant="h1" className="mb-2">Tu negocio</Text>
            <Text variant="body" color="secondary" className="mb-6">
              Empecemos con lo básico.
            </Text>
            <Card>
              <TextInput label="Nombre del negocio" value={name} onChangeText={setName} placeholder="Ej. Mi Tienda" />
              
              <Select 
                label="¿Qué tipo de negocio tienes?" 
                selectedValue={businessType} 
                onSelect={setBusinessType} 
                placeholder="Selecciona una opción..."
                options={[
                  { label: 'Ropa y Accesorios', value: 'Ropa y Accesorios' },
                  { label: 'Alimentos y Bebidas', value: 'Alimentos y Bebidas' },
                  { label: 'Tecnología', value: 'Tecnología' },
                  { label: 'Hogar', value: 'Hogar' },
                  { label: 'Salud y Belleza', value: 'Salud y Belleza' },
                  { label: 'Ferretería', value: 'Ferretería' },
                  { label: 'Papelería', value: 'Papelería' },
                  { label: 'Otro', value: 'Otro' }
                ]} 
              />
              {businessType === 'Otro' && (
                <TextInput label="Escribe tu tipo de negocio" value={productType} onChangeText={setProductType} placeholder="Ej. Artesanías" />
              )}
            </Card>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text variant="h1" className="mb-2">Tus productos</Text>
            <Text variant="body" color="secondary" className="mb-6">
              ¿Qué tipo de artículos manejas?
            </Text>
            <Card>
              <TextInput label="Productos principales" value={productType} onChangeText={setProductType} placeholder="Ej. Camisetas, Zapatos" />
              
              <Select 
                label="¿Cómo controlas la cantidad?" 
                selectedValue={defaultUnit} 
                onSelect={setDefaultUnit} 
                placeholder="Selecciona una unidad..."
                options={[
                  { label: 'Unidades', value: 'Unidad' },
                  { label: 'Kilogramos (kg)', value: 'kg' },
                  { label: 'Gramos (g)', value: 'g' },
                  { label: 'Litros (L)', value: 'L' },
                  { label: 'Mililitros (ml)', value: 'ml' },
                  { label: 'Metros (m)', value: 'm' }
                ]} 
              />
            </Card>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text variant="h1" className="mb-2">Información</Text>
            <Text variant="body" color="secondary" className="mb-6">
              ¿Qué información extra necesitas guardar de tus productos?
            </Text>
            
            {attributes.length > 0 && (
              <Card className="mb-4">
                {attributes.map(attr => (
                  <View key={attr.id} className="flex-row items-center justify-between bg-surface-variant p-3 rounded-xl mb-2 border border-border">
                    <View>
                      <Text className="font-medium">{attr.name} {attr.isRequired ? '*' : ''}</Text>
                      <Text variant="caption" color="secondary">
                        {attr.dataType === 'text' ? 'Texto' : attr.dataType === 'number' ? 'Número' : attr.dataType === 'boolean' ? 'Sí / No' : 'Fecha'}
                      </Text>
                    </View>
                    <Button title="Quitar" variant="outline" onPress={() => handleRemoveAttribute(attr.id)} className="py-1 px-3 border-error" />
                  </View>
                ))}
              </Card>
            )}

            <Card>
              <Text className="font-semibold mb-3 text-lg">Nueva característica</Text>
              <TextInput label="Nombre (Ej: Marca, Color)" value={newAttrName} onChangeText={setNewAttrName} placeholder="Color" />
              
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
            </Card>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text variant="h1" className="mb-2">Reglas de inventario</Text>
            <Text variant="body" color="secondary" className="mb-6">
              Configura cómo gestionarás el stock.
            </Text>
            <Card>
              <Switch label="¿Quieres usar categorías?" value={useCategories} onValueChange={setUseCategories} />
              <Switch label="¿Quieres usar códigos de producto?" value={useProductCodes} onValueChange={setUseProductCodes} />
              <Switch label="¿Quieres alertas de stock mínimo?" value={useMinStock} onValueChange={setUseMinStock} />
              <Switch label="¿Tus productos tienen fecha de vencimiento?" value={useExpirationDates} onValueChange={setUseExpirationDates} />
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Footer navigation */}
      <View className="p-4 bg-surface border-t border-border flex-row gap-4">
        {step > 0 && (
          <Button title="Volver" variant="outline" onPress={prevStep} className="flex-1" />
        )}
        {step < totalSteps - 1 ? (
          <Button title="Continuar" variant="primary" onPress={nextStep} className="flex-1" />
        ) : (
          <Button title="Guardar" variant="primary" loading={loading} onPress={handleSave} className="flex-1" />
        )}
      </View>
    </Screen>
  );
}
