import { View, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';

export default function ResetScreen() {
  const { setProfile, setAttributes } = useConfigStore();
  
  // NOTE: Depending on your exact store structure, you might have specific clear functions
  // For frontend-only, this provides the basic structural UX.

  const handleReset = () => {
    Alert.alert(
      '¿Estás seguro?',
      'Esta acción eliminará toda la configuración, incluyendo las características de los productos. Los productos y movimientos actuales no tendrán la misma estructura.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Restablecer', 
          style: 'destructive',
          onPress: () => {
            // Note: In a real app we'd also wipe products and movements, 
            // but the prompt strictly says not to add backend or change existing scope unnecessarily.
            // Resetting profile causes the app to return to Onboarding.
            setProfile(null as any);
            setAttributes([]);
            router.replace('/' as any);
          }
        }
      ]
    );
  };

  return (
    <Screen className="bg-background">
      <View className="px-4 pt-4 pb-2 flex-row items-center border-b border-border/50">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <SymbolView name="chevron.left" size={24} tintColor="rgb(var(--color-text))" />
        </TouchableOpacity>
        <Text variant="h2" className="ml-2">Restablecer</Text>
      </View>
      <View className="flex-1 px-6 pt-10 items-center">
        <View className="w-16 h-16 bg-error/10 rounded-full items-center justify-center mb-6">
          <SymbolView name="exclamationmark.triangle" size={32} tintColor="rgb(var(--color-error))" />
        </View>
        <Text variant="h2" className="mb-4 text-center">Restablecer la configuración</Text>
        <Text variant="caption" color="secondary" className="text-center text-base mb-8">
          Al restablecer, la aplicación volverá al estado inicial y te pedirá que configures tu negocio nuevamente.
        </Text>
        <Button 
          title="Borrar configuración y reiniciar" 
          variant="destructive" 
          onPress={handleReset} 
          className="w-full"
        />
      </View>
    </Screen>
  );
}
