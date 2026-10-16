import { View, TouchableOpacity, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Text } from '@/components/ui/Text';

export function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Inicio', icon: 'house', activeIcon: 'house.fill', route: '/' },
    { name: 'Inventario', icon: 'cube.box', activeIcon: 'cube.box.fill', route: '/products' },
    { name: 'Movimientos', icon: 'arrow.up', activeIcon: 'arrow.up', route: '/movements' },
    { name: 'Análisis IA', icon: 'sparkles', activeIcon: 'sparkles', route: '/assistant' },
    { name: 'Configuración', icon: 'gearshape', activeIcon: 'gearshape.fill', route: '/settings' },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border flex-row items-center justify-between px-2 py-3 pb-8">
      {tabs.map((tab) => {
        const isActive = tab.route === '/' 
          ? pathname === '/' 
          : pathname.startsWith(tab.route);

        return (
          <TouchableOpacity 
            key={tab.route}
            className={`items-center flex-1`} 
            onPress={() => {
              if (!isActive) {
                router.replace(tab.route as any);
              }
            }}
          >
            <View className={`mb-1`}>
              <SymbolView 
                name={(isActive ? tab.activeIcon : tab.icon) as any} 
                size={24} 
                tintColor={isActive ? "rgb(var(--color-primary))" : "rgb(var(--color-disabled))"} 
              />
            </View>
            <Text className={`text-[11px] ${isActive ? 'font-semibold text-primary' : 'font-medium text-disabled'}`}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
