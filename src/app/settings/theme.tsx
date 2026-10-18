import { View, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/use-theme';
import { THEME_CONFIG, ThemeMode } from '@/constants/theme';

interface ThemeOption {
  id: ThemeMode;
  name: string;
  description: string;
  previewBg: string;
  previewSurface: string;
  previewPrimary: string;
  previewText: string;
  previewBorder: string;
}

const THEMES: ThemeOption[] = [
  {
    id: 'light',
    name: 'Claro',
    description: 'Fondo claro (#F8FAFC) con tarjetas blancas (#FFFFFF) y azul PollyStock (#2563EB)',
    previewBg: THEME_CONFIG.light.colors.background,
    previewSurface: THEME_CONFIG.light.colors.surface,
    previewPrimary: THEME_CONFIG.light.colors.primary,
    previewText: THEME_CONFIG.light.colors.text,
    previewBorder: THEME_CONFIG.light.colors.border,
  },
  {
    id: 'dark',
    name: 'Oscuro',
    description: 'Fondo oscuro (#0F172A) con tarjetas (#1E293B) y azul brillante (#60A5FA)',
    previewBg: THEME_CONFIG.dark.colors.background,
    previewSurface: THEME_CONFIG.dark.colors.surface,
    previewPrimary: THEME_CONFIG.dark.colors.primary,
    previewText: THEME_CONFIG.dark.colors.text,
    previewBorder: THEME_CONFIG.dark.colors.border,
  },
];

export default function ThemeSettingsScreen() {
  const { theme: activeTheme, setTheme, colors } = useTheme();

  const handleSelectTheme = async (themeId: ThemeMode) => {
    try {
      await setTheme(themeId);
    } catch (error: any) {
      console.error('Failed to save theme', error);
    }
  };

  return (
    <Screen className="bg-background">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 flex-row items-center border-b border-border/50">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full"
          accessibilityLabel="Volver a ajustes"
        >
          <SymbolView name="chevron.left" size={24} tintColor={colors.text} />
        </TouchableOpacity>
        <Text variant="h2" className="ml-2 font-bold">Apariencia</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        <Text variant="body" color="secondary" className="mb-6 leading-relaxed">
          Elige entre el modo Claro y Oscuro. El cambio se aplica inmediatamente en toda la aplicación y se sincroniza en tu cuenta.
        </Text>

        <View className="gap-4">
          {THEMES.map((item) => {
            const isSelected = activeTheme === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleSelectTheme(item.id)}
                activeOpacity={0.8}
                className={`bg-surface border p-5 rounded-2xl flex-row items-center justify-between shadow-sm ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
              >
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center mb-2">
                    {/* Visual Color Palette Swatch */}
                    <View 
                      className="flex-row items-center mr-3 px-2 py-1 rounded-full border border-border"
                      style={{ backgroundColor: item.previewSurface }}
                    >
                      <View 
                        style={{ backgroundColor: item.previewBg, borderColor: item.previewBorder }} 
                        className="w-4 h-4 rounded-full border" 
                      />
                      <View 
                        style={{ backgroundColor: item.previewPrimary }} 
                        className="w-4 h-4 rounded-full ml-1" 
                      />
                      <View 
                        style={{ backgroundColor: item.previewText }} 
                        className="w-4 h-4 rounded-full ml-1" 
                      />
                    </View>
                    <Text variant="h3" className="font-bold">{item.name}</Text>
                  </View>
                  <Text variant="caption" color="secondary" className="leading-relaxed">
                    {item.description}
                  </Text>
                </View>

                {/* Visible Radio/Checkmark Indicator */}
                <View 
                  className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
                    isSelected ? 'border-primary bg-primary' : 'border-disabled bg-transparent'
                  }`}
                >
                  {isSelected && <SymbolView name="checkmark" size={14} tintColor="white" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}
