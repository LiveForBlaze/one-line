import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, AppState, type AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import '@/i18n';
import { initSchema } from '@/db/client';
import { configureNotificationHandler } from '@/services/notifications';
import { useAuthStore } from '@/store/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

initSchema();
configureNotificationHandler();

function PrivateModeGuard() {
  const { lockPrivate } = useAuthStore();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const leavingForeground =
        appState.current === 'active' &&
        (next === 'background' || next === 'inactive');

      // Private Mode ALWAYS locks when app leaves foreground
      if (leavingForeground) lockPrivate();

      appState.current = next;
    });
    return () => sub.remove();
  }, [lockPrivate]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="pin/setup"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
      <PrivateModeGuard />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
