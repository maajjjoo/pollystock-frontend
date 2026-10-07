import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <View
      className={`bg-surface rounded-[24px] p-5 shadow-sm border border-border ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
