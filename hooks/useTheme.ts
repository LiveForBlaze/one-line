import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export type ThemeColors = typeof Colors.light & typeof Colors.dark;

export function useTheme() {
  const scheme = useColorScheme() ?? 'light';
  return Colors[scheme] as typeof Colors.light | typeof Colors.dark;
}

export function useColorSchemeKey(): 'light' | 'dark' {
  return useColorScheme() ?? 'light';
}
