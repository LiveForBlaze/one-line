import { Platform } from "react-native";

export const Palette = {
  gold: "#A8743B",
  goldSoft: "#F1E2CC",
  bronze: "#7C5642",
  moss: "#68876A",
  mossSoft: "#E2ECE1",
  rose: "#BF7368",
  roseSoft: "#F4E3E0",
  stone: "#97897D",
  stoneDark: "#796C61",
} as const;

export const Colors = {
  light: {
    background: "#F5EFE6",
    surface: "#FFFDF9",
    surfaceElevated: "#ECE2D5",
    text: "#201A15",
    textSecondary: "#6E645B",
    textTertiary: "#9C9084",
    border: "#E1D3C2",
    borderStrong: "#CBB9A3",
    tint: Palette.gold,
    tint2: Palette.bronze,
    tintBackground: Palette.goldSoft,
    positive: Palette.moss,
    positiveBackground: Palette.mossSoft,
    neutral: Palette.stone,
    challenging: Palette.rose,
    challengingBackground: Palette.roseSoft,
    tabBar: "#FBF6EF",
    tabBarBorder: "#E1D3C2",
    tabIconDefault: "#978C80",
    tabIconSelected: Palette.gold,
    icon: "#978C80",
  },
  dark: {
    background: "#14110F",
    surface: "#201A17",
    surfaceElevated: "#2B2420",
    text: "#F5EEE7",
    textSecondary: "#A09286",
    textTertiary: "#6E6258",
    border: "#342C27",
    borderStrong: "#4A3E36",
    tint: "#D39A57",
    tint2: "#C48D72",
    tintBackground: "#2A2119",
    positive: "#7DA283",
    positiveBackground: "#212F24",
    neutral: Palette.stoneDark,
    challenging: "#CD8377",
    challengingBackground: "#34211F",
    tabBar: "#1A1512",
    tabBarBorder: "#342C27",
    tabIconDefault: "#796F66",
    tabIconSelected: "#D39A57",
    icon: "#796F66",
  },
} as const;

export type ColorScheme = "light" | "dark";

const MonoFont = Platform.select({
  ios: "ui-monospace",
  android: "monospace",
  default: "monospace",
})!;

export const Fonts = {
  sansRegular: "Manrope_400Regular",
  sansMedium: "Manrope_500Medium",
  sansSemibold: "Manrope_600SemiBold",
  sansBold: "Manrope_700Bold",
  serifRegular: "Newsreader_400Regular",
  serifMedium: "Newsreader_500Medium",
  serifSemibold: "Newsreader_600SemiBold",
  serifBold: "Newsreader_700Bold",
  mono: MonoFont,
} as const;

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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
