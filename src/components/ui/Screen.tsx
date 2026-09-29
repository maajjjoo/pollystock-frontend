import { SafeAreaView } from 'react-native-safe-area-context';
import { ViewProps, View } from 'react-native';

export interface ScreenProps extends ViewProps {
  className?: string;
  withSafeArea?: boolean;
}

export function Screen({ children, className = '', withSafeArea = true, ...props }: ScreenProps) {
  const Container = withSafeArea ? SafeAreaView : View;
  
  return (
    <Container className={`flex-1 bg-background ${className}`} {...props}>
      {children}
    </Container>
  );
}
