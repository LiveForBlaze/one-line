import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import "react-native-reanimated";

import { Colors } from "@/constants/theme";
import { initSchema } from "@/db/client";
import { useColorSchemeKey } from "@/hooks/useTheme";
import "@/i18n";
import { configureNotificationHandler } from "@/services/notifications";
import { useAuthStore } from "@/store/auth";

export const unstable_settings = {
  anchor: "(tabs)",
};

initSchema();
configureNotificationHandler();

function PrivateModeGuard() {
  const { lockPrivate } = useAuthStore();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const leavingForeground =
        appState.current === "active" &&
        (next === "background" || next === "inactive");

      // Private Mode ALWAYS locks when app leaves foreground
      if (leavingForeground) lockPrivate();

      appState.current = next;
    });
    return () => sub.remove();
  }, [lockPrivate]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorSchemeKey();
  const navigationTheme =
    colorScheme === "dark"
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            primary: Colors.dark.tint,
            background: Colors.dark.background,
            card: Colors.dark.surface,
            text: Colors.dark.text,
            border: Colors.dark.border,
            notification: Colors.dark.tint,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: Colors.light.tint,
            background: Colors.light.background,
            card: Colors.light.surface,
            text: Colors.light.text,
            border: Colors.light.border,
            notification: Colors.light.tint,
          },
        };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="pin/setup"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
      <PrivateModeGuard />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
