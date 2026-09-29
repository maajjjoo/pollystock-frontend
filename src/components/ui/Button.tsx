import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Text } from './Text';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  title: string;
  loading?: boolean;
  className?: string;
}

export function Button({ 
  variant = 'primary', 
  title, 
  loading = false, 
  disabled, 
  className = '', 
  ...props 
}: ButtonProps) {
  
  const baseStyles = 'py-3 px-4 rounded-lg flex-row justify-center items-center';
  
  let variantStyles = '';
  let textVariant: 'default' | 'primary' | 'secondary' = 'default';
  
  if (disabled) {
    variantStyles = 'bg-disabled-bg border-disabled-bg';
    textVariant = 'secondary';
  } else {
    switch (variant) {
      case 'primary':
        variantStyles = 'bg-primary';
        break;
      case 'secondary':
        variantStyles = 'bg-secondary';
        break;
      case 'destructive':
        variantStyles = 'bg-error';
        break;
      case 'outline':
        variantStyles = 'bg-transparent border-2 border-primary';
        textVariant = 'primary';
        break;
    }
  }

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? 'rgb(var(--color-primary))' : 'white'} />
      ) : (
        <Text 
          variant="h3" 
          color={textVariant} 
          className={variant !== 'outline' && !disabled ? 'text-white' : ''}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
