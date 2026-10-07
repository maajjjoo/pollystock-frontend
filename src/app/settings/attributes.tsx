import { View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';

export default function AttributesScreen() {
  const { attributes } = useConfigStore();

  return (
    <Screen className="bg-background">
      <View className="px-4 pt-4 pb-2 flex-row items-center border-b border-border/50">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <SymbolView name="chevron.left" size={24} tintColor="rgb(var(--color-text))" />
        </TouchableOpacity>
        <Text variant="h2" className="text-xl text-text font-bold ml-2">Características</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <Text variant="caption" color="secondary" className="mb-6 px-2">
          Estas son las características configuradas para tus productos.
        </Text>

        <View className="bg-surface rounded-2xl border border-border overflow-hidden">
          {attributes.length > 0 ? (
            attributes.map((attr, idx) => (
              <View 
                key={attr.id} 
                className={`p-4 flex-row justify-between items-center ${idx < attributes.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <View>
                  <Text className="font-bold text-text mb-1">{attr.name}</Text>
                  <Text variant="caption" color="secondary">
                    Tipo: {attr.dataType === 'text' ? 'Texto' : attr.dataType === 'number' ? 'Número' : 'Opción Sí/No'}
                  </Text>
                </View>
                {attr.isRequired && (
                  <View className="bg-primary/10 px-2 py-1 rounded">
                    <Text className="text-xs font-medium text-primary">Obligatorio</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className="p-8 items-center">
              <Text color="secondary">No hay características configuradas.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
