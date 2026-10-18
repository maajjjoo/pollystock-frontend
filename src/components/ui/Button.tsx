import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, View } from 'react-native';
import { SymbolView, SFSymbol } from 'expo-symbols';
import { Text } from './Text';
import { useTheme } from '@/hooks/use-theme';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'destructive-outline';
  title: string;
  icon?: SFSymbol;
  loading?: boolean;
  className?: string;
}

export function Button({ 
  variant = 'primary', 
  title, 
  icon, 
  loading = false, 
  disabled, 
  className = '', 
  ...props 
}: ButtonProps) {
  const { colors } = useTheme();
  
  const baseStyles = 'py-4 px-6 rounded-2xl flex-row justify-center items-center active:opacity-80';
  
  let variantStyles = '';
  let textVariant: 'default' | 'primary' | 'secondary' | 'error' = 'default';
  
  if (disabled) {
    variantStyles = 'bg-disabled-bg border border-border';
    textVariant = 'secondary';
  } else {
    switch (variant) {
      case 'primary':
        variantStyles = 'bg-primary shadow-sm';
        break;
      case 'secondary':
        variantStyles = 'bg-surface-variant border border-border';
        break;
      case 'destructive':
        variantStyles = 'bg-error shadow-sm';
        break;
      case 'destructive-outline':
        variantStyles = 'bg-transparent border border-error';
        textVariant = 'error';
        break;
      case 'outline':
        variantStyles = 'bg-transparent border border-primary';
        textVariant = 'primary';
        break;
    }
  }

  const iconTintColor = variant !== 'outline' && variant !== 'destructive-outline' && variant !== 'secondary' && !disabled
    ? 'white'
    : (variant === 'destructive-outline' ? colors.error : colors.primary);

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={
            variant === 'outline' || variant === 'destructive-outline' 
              ? (variant === 'outline' ? colors.primary : colors.error) 
              : 'white'
          } 
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && (
            <View className="mr-2">
              <SymbolView 
                name={icon} 
                size={18} 
                tintColor={iconTintColor} 
              />
            </View>
          )}
          <Text 
            variant="body" 
            color={textVariant} 
            className={`font-semibold text-base ${
              variant !== 'outline' && variant !== 'destructive-outline' && variant !== 'secondary' && !disabled 
                ? 'text-white' 
                : ''
            }`}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
