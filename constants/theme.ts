import { Platform } from "react-native";

export const Palette = {
  amber: "#C8933A",
  amberLight: "#F5EDD9",
  amberDark: "#D4A84B",
  amberDarkBg: "#2A2217",
  green: "#6BAE75",
  greenLight: "#E5F1E7",
  greenDark: "#5A9E64",
  red: "#C97A72",
  redLight: "#F5E4E1",
  redDark: "#B67068",
  gray: "#A8A49F",
  grayDark: "#807C77",
} as const;

export const Colors = {
  light: {
    background: "#F6F1E8",
    surface: "#FFFDFC",
    surfaceElevated: "#F1E8DA",
    text: "#1E1A16",
    textSecondary: "#756B61",
    textTertiary: "#A2978B",
    border: "#E7DCCF",
    borderStrong: "#D1C0AD",
    tint: Palette.amber,
    tintBackground: Palette.amberLight,
    positive: Palette.green,
    positiveBackground: Palette.greenLight,
    neutral: Palette.gray,
    challenging: Palette.red,
    challengingBackground: Palette.redLight,
    tabBar: "#FBF7F0",
    tabBarBorder: "#E7DCCF",
    tabIconDefault: "#9F958A",
    tabIconSelected: Palette.amber,
    icon: "#9F958A",
  },
  dark: {
    background: "#161411",
    surface: "#211D18",
    surfaceElevated: "#2A241E",
    text: "#F3EEE7",
    textSecondary: "#93867A",
    textTertiary: "#62594F",
    border: "#322B24",
    borderStrong: "#43392F",
    tint: Palette.amberDark,
    tintBackground: Palette.amberDarkBg,
    positive: Palette.greenDark,
    positiveBackground: "#243329",
    neutral: Palette.grayDark,
    challenging: Palette.redDark,
    challengingBackground: "#392523",
    tabBar: "#1C1814",
    tabBarBorder: "#322B24",
    tabIconDefault: "#70675E",
    tabIconSelected: Palette.amberDark,
    icon: "#70675E",
  },
} as const;

export type ColorScheme = "light" | "dark";

export const Fonts = Platform.select({
  ios: {
    sans: "System",
    serif: "Georgia",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  android: {
    sans: "sans-serif",
    serif: "serif",
    rounded: "sans-serif",
    mono: "monospace",
  },
  default: {
    sans: "System",
    serif: "Georgia",
    rounded: "System",
    mono: "monospace",
  },
})!;

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  "2xl": 28,
  "3xl": 34,
} as const;

export const FontWeights = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
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
  sm: 12,
  md: 12,
  lg: 12,
  xl: 12,
  full: 9999,
} as const;
