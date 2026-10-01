import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, View } from 'react-native';
import { SymbolView, SFSymbol } from 'expo-symbols';
import { Text } from './Text';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  icon?: SFSymbol;
  showCharCount?: boolean;
  className?: string;
}

export function TextInput({ label, error, icon, showCharCount, maxLength, value, className = '', ...props }: TextInputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      <View className="flex-row justify-between items-end mb-1.5 ml-1">
        {label && <Text variant="caption" className="font-medium text-text-secondary">{label}</Text>}
        {showCharCount && maxLength && (
          <Text variant="caption" className="text-text-secondary text-[10px]">
            {value?.length || 0} / {maxLength}
          </Text>
        )}
      </View>
      <View className={`bg-surface border ${error ? 'border-error' : 'border-border'} rounded-xl flex-row items-center px-4`}>
        {icon && (
          <View className="mr-2 opacity-50">
            <SymbolView name={icon} size={20} tintColor="rgb(var(--color-text))" />
          </View>
        )}
        <RNTextInput
          className="flex-1 py-3.5 text-text text-base leading-tight"
          placeholderTextColor="rgb(var(--color-disabled))"
          maxLength={maxLength}
          value={value}
          {...props}
        />
      </View>
      {error && <Text variant="caption" color="error" className="mt-1">{error}</Text>}
    </View>
  );
}
