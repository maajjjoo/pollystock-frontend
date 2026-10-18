import { useCallback } from 'react';
import { THEME_CONFIG, normalizeTheme, ThemeMode, ThemeColors, ThemeVariables } from '@/constants/theme';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';

export interface UseThemeReturn {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  rgb: ThemeVariables;
  themeClass: 'theme-light' | 'theme-dark';
  setTheme: (mode: ThemeMode) => Promise<void>;
  // Direct color property access for convenience:
  primary: string;
  primaryVariant: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  border: string;
  disabled: string;
  disabledBg: string;
  overlay: string;
  success: string;
  warning: string;
  error: string;
  backgroundElement: string;
  backgroundSelected: string;
}

export function useTheme(): UseThemeReturn {
  const profile = useConfigStore((state) => state.profile);
  const saveProfile = useConfigStore((state) => state.saveProfile);

  const theme: ThemeMode = normalizeTheme(profile?.theme);
  const isDark = theme === 'dark';
  const config = THEME_CONFIG[theme];

  const setTheme = useCallback(async (newTheme: ThemeMode) => {
    if (!profile) return;
    await saveProfile({ ...profile, theme: newTheme });
  }, [profile, saveProfile]);

  return {
    theme,
    isDark,
    colors: config.colors,
    rgb: config.rgb,
    themeClass: isDark ? 'theme-dark' : 'theme-light',
    setTheme,
    ...config.colors,
  };
}
