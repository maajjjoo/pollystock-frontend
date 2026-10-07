import { View, TouchableOpacity } from 'react-native';
import { router, usePathname } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Text } from '@/components/ui/Text';

export function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Inicio', icon: 'house.fill', route: '/' },
    { name: 'Productos', icon: 'cube.box.fill', route: '/products' },
    { name: 'Movimientos', icon: 'clock.arrow.circlepath', route: '/movements' },
    { name: 'Asistente', icon: 'sparkles', route: '/assistant' },
    { name: 'Configuración', icon: 'gearshape.fill', route: '/settings' },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border flex-row items-center justify-between px-2 py-2 pb-6 shadow-sm">
      {tabs.map((tab) => {
        // Simple logic to detect active tab.
        // /products/new should still highlight Productos.
        const isActive = tab.route === '/' 
          ? pathname === '/' 
          : pathname.startsWith(tab.route);

        return (
          <TouchableOpacity 
            key={tab.route}
            className={`items-center flex-1 ${isActive ? 'opacity-100' : 'opacity-50'}`} 
            onPress={() => {
              if (!isActive) {
                router.replace(tab.route as any);
              }
            }}
          >
            <View className={`mb-1 py-1 px-4 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
              <SymbolView 
                name={tab.icon as any} 
                size={22} 
                tintColor={isActive ? "rgb(var(--color-primary))" : "rgb(var(--color-text))"} 
              />
            </View>
            <Text className={`text-[10px] ${isActive ? 'font-semibold text-primary' : 'font-medium text-text'}`}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
