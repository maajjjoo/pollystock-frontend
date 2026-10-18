import { View, TouchableOpacity } from 'react-native';
import { router, usePathname } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/use-theme';

export function BottomNav() {
  const pathname = usePathname();
  const { colors } = useTheme();

  const tabs = [
    { name: 'Inicio', icon: 'house', activeIcon: 'house.fill', route: '/' },
    { name: 'Inventario', icon: 'cube.box', activeIcon: 'cube.box.fill', route: '/products' },
    { name: 'Movimientos', icon: 'arrow.up', activeIcon: 'arrow.up', route: '/movements' },
    { name: 'Análisis IA', icon: 'sparkles', activeIcon: 'sparkles', route: '/assistant' },
    { name: 'Configuración', icon: 'gearshape', activeIcon: 'gearshape.fill', route: '/settings' },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border flex-row items-center justify-between px-1 py-2 pb-7">
      {tabs.map((tab) => {
        const isActive = tab.route === '/' 
          ? pathname === '/' 
          : pathname.startsWith(tab.route);

        return (
          <TouchableOpacity 
            key={tab.route}
            className="items-center justify-center flex-1 py-1 px-0.5" 
            onPress={() => {
              if (!isActive) {
                router.replace(tab.route as any);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.name}
          >
            <View className="mb-1 items-center justify-center">
              <SymbolView 
                name={(isActive ? tab.activeIcon : tab.icon) as any} 
                size={22} 
                tintColor={isActive ? colors.primary : colors.disabled} 
              />
            </View>
            <Text 
              numberOfLines={1}
              adjustsFontSizeToFit
              className={`text-[10px] tracking-tight text-center ${
                isActive ? 'font-semibold text-primary' : 'font-medium text-disabled'
              }`}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
