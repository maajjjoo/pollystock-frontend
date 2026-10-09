import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';
import '../global.css';

export default function RootLayout() {
  const { profile, loadConfig } = useConfigStore();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      loadConfig();
      hasLoaded.current = true;
    }
  }, [loadConfig]);

  const themeClass = profile?.theme || 'theme-natural';

  return (
    <View className={`flex-1 ${themeClass} bg-background`}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="index" />
      </Stack>
    </View>
  );
}
