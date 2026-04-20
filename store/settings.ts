import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppLanguage = string;

interface SettingsState {
  notificationsEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
  biometricsEnabled: boolean;
  language: AppLanguage | null; // null = follow device

  setNotificationsEnabled: (v: boolean) => void;
  setNotificationTime: (hour: number, minute: number) => void;
  setBiometricsEnabled: (v: boolean) => void;
  setLanguage: (lang: AppLanguage | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      notificationHour: 21,
      notificationMinute: 0,
      biometricsEnabled: false,
      language: null,

      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      setNotificationTime: (hour, minute) => set({ notificationHour: hour, notificationMinute: minute }),
      setBiometricsEnabled: (v) => set({ biometricsEnabled: v }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
