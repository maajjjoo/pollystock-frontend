import '@/global.css';
import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
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

export type ThemeVariables = Record<string, string>;

export const THEME_CONFIG: Record<ThemeMode, {
  name: string;
  description: string;
  colors: ThemeColors;
  rgb: ThemeVariables;
}> = {
  light: {
    name: 'Claro',
    description: 'Fondo claro con azul primario (#2563EB) y alto contraste',
    colors: {
      primary: '#2563EB',
      primaryVariant: '#1D4ED8',
      secondary: '#64748B',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F1F5F9',
      text: '#0F172A',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      disabled: '#94A3B8',
      disabledBg: '#F1F5F9',
      overlay: '#0F172A',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      backgroundElement: '#F1F5F9',
      backgroundSelected: '#E2E8F0',
    },
    rgb: {
      '--color-primary': '37 99 235',
      '--color-primary-variant': '29 78 216',
      '--color-secondary': '100 116 139',
      '--color-background': '248 250 252',
      '--color-surface': '255 255 255',
      '--color-surface-variant': '241 245 249',
      '--color-text': '15 23 42',
      '--color-text-secondary': '100 116 139',
      '--color-border': '226 232 240',
      '--color-disabled': '148 163 184',
      '--color-disabled-bg': '241 245 249',
      '--color-overlay': '15 23 42',
      '--color-success': '16 185 129',
      '--color-warning': '245 158 11',
      '--color-error': '239 68 68',
    },
  },
  dark: {
    name: 'Oscuro',
    description: 'Fondo oscuro (#0F172A) con tarjetas (#1E293B) y azul (#60A5FA)',
    colors: {
      primary: '#60A5FA',
      primaryVariant: '#3B82F6',
      secondary: '#94A3B8',
      background: '#0F172A',
      surface: '#1E293B',
      surfaceVariant: '#334155',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      border: '#334155',
      disabled: '#64748B',
      disabledBg: '#1E293B',
      overlay: '#000000',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      backgroundElement: '#334155',
      backgroundSelected: '#475569',
    },
    rgb: {
      '--color-primary': '96 165 250',
      '--color-primary-variant': '59 130 246',
      '--color-secondary': '148 163 184',
      '--color-background': '15 23 42',
      '--color-surface': '30 41 59',
      '--color-surface-variant': '51 65 85',
      '--color-text': '248 250 252',
      '--color-text-secondary': '148 163 184',
      '--color-border': '51 65 85',
      '--color-disabled': '100 116 139',
      '--color-disabled-bg': '30 41 59',
      '--color-overlay': '0 0 0',
      '--color-success': '52 211 153',
      '--color-warning': '251 191 36',
      '--color-error': '248 113 113',
    },
  },
};

/**
 * Safely maps any existing/legacy theme identifier to either 'light' or 'dark'
 */
export function normalizeTheme(theme?: string | null): ThemeMode {
  if (!theme) return 'light';
  const lower = theme.toLowerCase().trim();
  if (lower === 'dark' || lower === 'theme-dark' || lower === 'oscuro') {
    return 'dark';
  }
  return 'light';
}

/**
 * Resolves CSS variable references like "rgb(var(--color-primary))" to concrete hex strings
 */
export function resolveColor(color: string | undefined, colors: ThemeColors): string | undefined {
  if (!color) return undefined;
  if (color.includes('--color-primary-variant')) return colors.primaryVariant;
  if (color.includes('--color-primary')) return colors.primary;
  if (color.includes('--color-secondary')) return colors.secondary;
  if (color.includes('--color-background')) return colors.background;
  if (color.includes('--color-surface-variant')) return colors.surfaceVariant;
  if (color.includes('--color-surface')) return colors.surface;
  if (color.includes('--color-text-secondary')) return colors.textSecondary;
  if (color.includes('--color-text')) return colors.text;
  if (color.includes('--color-border')) return colors.border;
  if (color.includes('--color-disabled-bg')) return colors.disabledBg;
  if (color.includes('--color-disabled')) return colors.disabled;
  if (color.includes('--color-warning')) return colors.warning;
  if (color.includes('--color-error')) return colors.error;
  if (color.includes('--color-success')) return colors.success;
  return color;
}

export const Colors = {
  light: THEME_CONFIG.light.colors,
  dark: THEME_CONFIG.dark.colors,
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
