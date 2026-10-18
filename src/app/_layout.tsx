import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';
import { normalizeTheme, THEME_CONFIG } from '@/constants/theme';
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

  const currentTheme = normalizeTheme(profile?.theme);
  const themeClass = currentTheme === 'dark' ? 'theme-dark' : 'theme-light';
  const themeVars = vars(THEME_CONFIG[currentTheme].rgb);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('theme-light', 'theme-dark', 'light', 'dark', 'theme-natural', 'theme-ocean', 'theme-warm', 'theme-classic');
      root.classList.add(themeClass);
      root.setAttribute('data-theme', currentTheme);

      // Apply CSS variables directly to :root on Web to cover portals, modals, and body
      const rgb = THEME_CONFIG[currentTheme].rgb;
      for (const [key, value] of Object.entries(rgb)) {
        root.style.setProperty(key, value);
      }
    }
  }, [currentTheme, themeClass]);

  return (
    <View style={themeVars} className={`flex-1 ${themeClass} bg-background`}>
      <StatusBar style={currentTheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="index" />
      </Stack>
    </View>
  );
}
