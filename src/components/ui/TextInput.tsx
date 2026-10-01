import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, View } from 'react-native';
import { SymbolView, SFSymbol } from 'expo-symbols';
import { Text } from './Text';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  icon?: SFSymbol;
  className?: string;
}

export function TextInput({ label, error, icon, className = '', ...props }: TextInputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text variant="caption" className="mb-1.5 ml-1 font-medium text-text-secondary">{label}</Text>}
      <View className={`bg-surface border ${error ? 'border-error' : 'border-border'} rounded-xl flex-row items-center px-4`}>
        {icon && (
          <View className="mr-2 opacity-50">
            <SymbolView name={icon} size={20} tintColor="rgb(var(--color-text))" />
          </View>
        )}
        <RNTextInput
          className="flex-1 py-3.5 text-text text-base leading-tight"
          placeholderTextColor="rgb(var(--color-disabled))"
          {...props}
        />
      </View>
      {error && <Text variant="caption" color="error" className="mt-1">{error}</Text>}
    </View>
  );
}
