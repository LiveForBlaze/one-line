import { Platform } from 'react-native';

export const Palette = {
  amber: '#C8933A',
  amberLight: '#F5EDD9',
  amberDark: '#D4A84B',
  amberDarkBg: '#2A2217',
  green: '#6BAE75',
  greenDark: '#5A9E64',
  orange: '#E8A870',
  orangeDark: '#D4956A',
  gray: '#A8A49F',
  grayDark: '#807C77',
} as const;

export const Colors = {
  light: {
    background: '#FAFAF8',
    surface: '#FFFFFF',
    surfaceElevated: '#F5F3F0',
    text: '#1A1917',
    textSecondary: '#6B6760',
    textTertiary: '#A8A49F',
    border: '#E5E3DF',
    borderStrong: '#C8C4BE',
    tint: Palette.amber,
    tintBackground: Palette.amberLight,
    positive: Palette.green,
    neutral: Palette.gray,
    challenging: Palette.orange,
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E3DF',
    tabIconDefault: '#A8A49F',
    tabIconSelected: Palette.amber,
    icon: '#A8A49F',
  },
  dark: {
    background: '#141413',
    surface: '#1E1E1C',
    surfaceElevated: '#252522',
    text: '#F0EDE8',
    textSecondary: '#8A8681',
    textTertiary: '#5A5753',
    border: '#2A2927',
    borderStrong: '#3A3835',
    tint: Palette.amberDark,
    tintBackground: Palette.amberDarkBg,
    positive: Palette.greenDark,
    neutral: Palette.grayDark,
    challenging: Palette.orangeDark,
    tabBar: '#1A1917',
    tabBarBorder: '#2A2927',
    tabIconDefault: '#5A5753',
    tabIconSelected: Palette.amberDark,
    icon: '#5A5753',
  },
} as const;

export type ColorScheme = 'light' | 'dark';

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'monospace',
  },
})!;

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
} as const;

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const Radii = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
