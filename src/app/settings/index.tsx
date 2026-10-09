import { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';
import { ValidationRules } from '@/utils/validation';
import { BottomNav } from '@/components/ui/BottomNav';

import { BusinessProfile } from '@/core/database/schema';

export default function SettingsScreen() {
  const { profile, setProfile } = useConfigStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<{ key: keyof BusinessProfile, label: string, maxLen: number, isNumeric?: boolean } | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!profile) return null;

  const openEdit = (key: keyof BusinessProfile, label: string, maxLen: number, isNumeric = false) => {
    setEditField({ key, label, maxLen, isNumeric });
    setEditValue(profile[key]?.toString() || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editField) {
      if (!editValue.trim() && !editField.isNumeric) {
        Alert.alert('Error', 'El valor no puede estar vacío.');
        return;
      }
      
      const val = editField.isNumeric ? Number(editValue) || 0 : editValue.trim();
      setProfile({ ...profile, [editField.key]: val } as any);
      Alert.alert('Éxito', 'Configuración actualizada.');
    }
    setEditModalVisible(false);
  };

  return (
    <Screen className="bg-background">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 border-b border-border/50 bg-background/90">
        <Text variant="h2" >Configuración</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* MI NEGOCIO */}
        <View className="mt-6 mb-2 px-6">
          <Text variant="caption" color="secondary" className="uppercase tracking-wider font-bold">Mi negocio</Text>
        </View>
        <View className="bg-surface border border-border rounded-2xl px-4 overflow-hidden mx-4 mb-6">
          <SettingsRow 
            title="Nombre del negocio" 
            value={profile.name} 
            onPress={() => openEdit('name', 'Nombre del negocio', ValidationRules.BUSINESS_NAME_MAX)} 
          />
          <SettingsRow 
            title="Tipo de negocio" 
            value={profile.businessType} 
            onPress={() => openEdit('businessType', 'Tipo de negocio', ValidationRules.BUSINESS_TYPE_MAX)} 
            isLast
          />
        </View>

        {/* INVENTARIO */}
        <View className="mt-8 mb-2 px-6">
          <Text variant="caption" color="secondary" className="uppercase tracking-wider font-bold">Inventario</Text>
        </View>
        <View className="bg-surface border border-border rounded-2xl px-4 overflow-hidden mx-4 mb-6">
          <SettingsRow 
            title="Productos manejados" 
            value={profile.productType} 
            onPress={() => openEdit('productType', 'Productos', ValidationRules.PRODUCT_TYPE_MAX)} 
          />
          <SettingsRow 
            title="Información de productos" 
            value="Configurar características" 
            onPress={() => router.push('/settings/attributes' as any)} 
          />
          <SettingsRow 
            title="Unidad de medida" 
            value={profile.defaultUnit} 
            onPress={() => openEdit('defaultUnit', 'Unidad de medida', ValidationRules.UNIT_MAX)} 
          />
          <SettingsRow 
            title="Categorías" 
            value={profile.useCategories ? 'Activadas' : 'Desactivadas'} 
            onPress={() => setProfile({ ...profile, useCategories: !profile.useCategories })} 
          />
          <SettingsRow 
            title="Código de producto (SKU)" 
            value={profile.useProductCodes ? 'Activado' : 'Desactivado'} 
            onPress={() => setProfile({ ...profile, useProductCodes: !profile.useProductCodes })} 
          />
          <SettingsRow 
            title="Alerta de stock bajo" 
            value={profile.useMinStock ? 'Activada' : 'Desactivada'} 
            onPress={() => setProfile({ ...profile, useMinStock: !profile.useMinStock })} 
          />
          {profile.useMinStock && (
            <SettingsRow 
              title="Nivel de alerta" 
              value={`${profile.minStock || 5} ${profile.defaultUnit || 'uds'}`}
              onPress={() => openEdit('minStock', 'Nivel de alerta (cantidad)', ValidationRules.MIN_STOCK_MAX, true)} 
            />
          )}
          <SettingsRow 
            title="Fecha de vencimiento" 
            value={profile.useExpirationDates ? 'Activada' : 'Desactivada'} 
            onPress={() => setProfile({ ...profile, useExpirationDates: !profile.useExpirationDates })} 
            isLast
          />
        </View>

        {/* APARIENCIA */}
        <View className="mt-8 mb-2 px-6">
          <Text variant="caption" color="secondary" className="uppercase tracking-wider font-bold">Apariencia</Text>
        </View>
        <View className="bg-surface border border-border rounded-2xl px-4 overflow-hidden mx-4 mb-6">
          <SettingsRow 
            title="Tema" 
            value={
              profile.theme === 'theme-ocean' ? 'Océano' : 
              profile.theme === 'theme-warm' ? 'Cálido' : 
              profile.theme === 'theme-classic' ? 'Clásico' : 'Natural'
            } 
            onPress={() => router.push('/settings/theme' as any)} 
            isLast
          />
        </View>

        {/* PREFERENCIAS */}
        <View className="mt-8 mb-2 px-6">
          <Text variant="caption" color="secondary" className="uppercase tracking-wider font-bold">Preferencias</Text>
        </View>
        <View className="bg-surface border border-border rounded-2xl px-4 overflow-hidden mx-4 mb-8">
          <SettingsRow 
            title="Restablecer configuración" 
            value="" 
            valueColor="text-error"
            onPress={() => router.push('/settings/reset' as any)} 
            isLast
          />
        </View>

      </ScrollView>

      {/* Edit Modal for simple text fields */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-overlay/40">
          <View className="bg-surface rounded-t-3xl p-6 shadow-lg">
            <View className="flex-row justify-between items-center mb-6">
              <Text variant="h2" className="text-xl">Editar {editField?.label.toLowerCase()}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} className="w-8 h-8 items-center justify-center bg-surface-variant rounded-full">
                <SymbolView name="xmark" size={16} tintColor="rgb(var(--color-text))" />
              </TouchableOpacity>
            </View>
            <TextInput 
              value={editValue}
              onChangeText={(t) => {
                if (editField?.isNumeric) {
                  setEditValue(t.replace(/[^0-9]/g, ''));
                } else {
                  setEditValue(t);
                }
              }}
              maxLength={editField?.maxLen || 100}
              keyboardType={editField?.isNumeric ? 'numeric' : 'default'}
              showCharCount
              autoFocus
            />
            <View className="flex-row gap-3 mt-4">
              <Button title="Cancelar" variant="outline" className="flex-1" onPress={() => setEditModalVisible(false)} />
              <Button title="Guardar" variant="primary" className="flex-1" onPress={handleSaveEdit} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <BottomNav />
    </Screen>
  );
}

function SettingsRow({ 
  title, 
  value, 
  valueColor = "text-text-secondary", 
  onPress, 
  isLast = false 
}: { 
  title: string; 
  value?: string; 
  valueColor?: string;
  onPress: () => void; 
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-row justify-between items-center py-4 ${!isLast ? 'border-b border-border/50' : ''}`}
    >
      <Text className="text-base text-text font-medium flex-1 mr-4" numberOfLines={2}>{title}</Text>
      <View className="flex-row items-center flex-shrink max-w-[50%]">
        {value ? (
          <Text className={`text-base ${valueColor} mr-2 flex-shrink`} numberOfLines={1}>{value}</Text>
        ) : null}
        <SymbolView name="chevron.right" size={16} tintColor="rgb(var(--color-disabled))" />
      </View>
    </TouchableOpacity>
  );
}
