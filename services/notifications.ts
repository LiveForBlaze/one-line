import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'daily-reminder';
const NOTIFICATION_ID = 'daily-reminder';

const PROMPTS = [
  'How did today go?',
  'One line before sleep',
  'What to remember from today?',
  'Capture today in one line',
  'A moment worth remembering?',
];

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  await cancelDailyReminder();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
    });
  }

  const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID,
    content: {
      title: 'OneLine',
      body: prompt,
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
}

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
