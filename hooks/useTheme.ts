import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSettingsStore } from "@/store/settings";

export type ThemeColors = typeof Colors.light & typeof Colors.dark;
export type ResolvedColorScheme = "light" | "dark";

export function useColorSchemeKey(): ResolvedColorScheme {
  const systemScheme = useColorScheme() ?? "light";
  const themeMode = useSettingsStore((state) => state.themeMode);

  if (themeMode === "system") {
    return systemScheme;
  }

  return themeMode;
}

export function useTheme() {
  const scheme = useColorSchemeKey();
  return Colors[scheme] as typeof Colors.light | typeof Colors.dark;
}
