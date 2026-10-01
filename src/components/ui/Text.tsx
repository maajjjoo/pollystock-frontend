import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: 'default' | 'secondary' | 'primary' | 'error';
  className?: string;
}

export function Text({ variant = 'body', color = 'default', className = '', ...props }: TextProps) {
  const variantStyles = {
    h1: 'text-2xl font-semibold tracking-tight',
    h2: 'text-xl font-medium tracking-tight',
    h3: 'text-lg font-medium',
    body: 'text-base font-normal leading-relaxed',
    caption: 'text-sm font-normal',
  };

  const colorStyles = {
    default: 'text-text',
    secondary: 'text-text-secondary',
    primary: 'text-primary',
    error: 'text-error',
  };

  return (
    <RNText
      className={`${variantStyles[variant]} ${colorStyles[color]} ${className}`}
      {...props}
    />
  );
}
