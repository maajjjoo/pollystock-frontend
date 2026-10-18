import { Switch as RNSwitch, View, Platform } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/hooks/use-theme';

interface SwitchProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  className?: string;
}

export function Switch({ label, description, value, onValueChange, className = '' }: SwitchProps) {
  const { colors, isDark } = useTheme();

  return (
    <View className={`flex-row justify-between items-center py-3 border-b border-border ${className}`}>
      <View className="flex-1 pr-4">
        <Text className="font-medium text-text">{label}</Text>
        {description && <Text variant="caption" color="secondary">{description}</Text>}
      </View>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ 
          false: colors.disabledBg, 
          true: colors.primary 
        }}
        thumbColor={Platform.OS === 'android' ? (value ? colors.surface : colors.disabled) : '#FFFFFF'}
        ios_backgroundColor={colors.disabledBg}
      />
    </View>
  );
}
