import { View, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';

const THEMES = [
  { id: 'theme-natural', name: 'Natural', description: 'Tonos verdes y orgánicos' },
  { id: 'theme-warm', name: 'Cálido', description: 'Tonos tierra y arena' },
  { id: 'theme-ocean', name: 'Océano', description: 'Tonos azules grisáceos' },
  { id: 'theme-classic', name: 'Clásico', description: 'Contraste monocromático' },
];

export default function ThemeSettingsScreen() {
  const { profile, setProfile } = useConfigStore();

  if (!profile) return null;

  const handleSelectTheme = (themeId: string) => {
    setProfile({ ...profile, theme: themeId });
  };

  return (
    <Screen className="bg-background">
      <View className="px-4 pt-4 pb-2 flex-row items-center border-b border-border/50">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <SymbolView name="chevron.left" size={24} tintColor="rgb(var(--color-text))" />
        </TouchableOpacity>
        <Text variant="h2" className="ml-2">Apariencia</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <Text variant="caption" color="secondary" className="mb-6">
          Selecciona la familia de colores para la aplicación. El cambio se aplica inmediatamente en todas las pantallas.
        </Text>

        <View className="gap-4">
          {THEMES.map(theme => {
            const isSelected = (profile.theme || 'theme-natural') === theme.id;

            return (
              <TouchableOpacity
                key={theme.id}
                onPress={() => handleSelectTheme(theme.id)}
                className={`bg-surface border p-5 rounded-[24px] flex-row items-center justify-between shadow-sm ${isSelected ? 'border-primary' : 'border-border'}`}
              >
                <View>
                  <Text variant="h3" className="mb-1">{theme.name}</Text>
                  <Text variant="caption" color="secondary">{theme.description}</Text>
                </View>
                <View className={`w-6 h-6 rounded-full border items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-disabled'}`}>
                  {isSelected && <SymbolView name="checkmark" size={12} tintColor="white" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}
