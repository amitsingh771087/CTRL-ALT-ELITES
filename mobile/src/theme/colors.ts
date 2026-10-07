/**
 * Central design tokens. Screens/components should always reference
 * these instead of hard-coding hex values, so the app can be re-themed
 * (e.g. dark mode) from one place.
 */
export const colors = {
  primary: '#1f5f99',
  primaryDark: '#164366',
  secondary: '#3a9b68',
  accent: '#a87420',

  background: '#f7fbff',
  surface: '#ffffff',
  border: '#d7e3ef',

  textPrimary: '#17324d',
  textSecondary: '#5d708a',
  textInverse: '#ffffff',

  success: '#2e7d4f',
  warning: '#c78d00',
  error: '#c0392b',

  disabled: '#a9b6c4',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};
