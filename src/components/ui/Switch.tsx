import { Switch as RNSwitch, View } from 'react-native';
import { Text } from './Text';

interface SwitchProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  className?: string;
}

export function Switch({ label, description, value, onValueChange, className = '' }: SwitchProps) {
  return (
    <View className={`flex-row justify-between items-center py-3 border-b border-border ${className}`}>
      <View className="flex-1 pr-4">
        <Text className="font-medium">{label}</Text>
        {description && <Text variant="caption" color="secondary">{description}</Text>}
      </View>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgb(var(--color-disabled-bg))', true: 'rgb(var(--color-primary))' }}
        thumbColor="white"
      />
    </View>
  );
}
