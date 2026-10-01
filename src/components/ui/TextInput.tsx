import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, View } from 'react-native';
import { Text } from './Text';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export function TextInput({ label, error, className = '', ...props }: TextInputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text variant="caption" className="mb-1.5 ml-1 font-medium text-text-secondary">{label}</Text>}
      <RNTextInput
        className={`bg-surface border ${error ? 'border-error' : 'border-border'} rounded-xl py-3.5 px-4 text-text text-base leading-tight`}
        placeholderTextColor="rgb(var(--color-disabled))"
        {...props}
      />
      {error && <Text variant="caption" color="error" className="mt-1">{error}</Text>}
    </View>
  );
}
