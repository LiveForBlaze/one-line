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
import { db, initSchema } from "@/db/client";
import { useColorSchemeKey } from "@/hooks/useTheme";
import "@/i18n";
import { configureNotificationHandler } from "@/services/notifications";
import { useAuthStore } from "@/store/auth";

export const unstable_settings = {
  anchor: "(tabs)",
};

initSchema();
configureNotificationHandler();

// TODO: remove demo entries
db.execSync(`
  INSERT OR IGNORE INTO entries (date, kind, text, mood_score, photo_path) VALUES ('2026-04-19', 'common', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.', 1, NULL);
  INSERT OR IGNORE INTO entries (date, kind, text, mood_score, photo_path) VALUES ('2026-04-17', 'common', 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.', 0, NULL);
  INSERT OR IGNORE INTO entries (date, kind, text, mood_score, photo_path) VALUES ('2026-04-14', 'common', 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', -1, NULL);
  INSERT OR IGNORE INTO entries (date, kind, text, mood_score, photo_path) VALUES ('2026-04-10', 'common', 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.', 1, NULL);
  INSERT OR IGNORE INTO entries (date, kind, text, mood_score, photo_path) VALUES ('2026-03-30', 'common', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed consequuntur magni.', 0, NULL);
`);

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
          options={{
            presentation: "fullScreenModal",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="pin/recovery"
          options={{
            presentation: "fullScreenModal",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
      <PrivateModeGuard />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
