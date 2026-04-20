import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en';
import ru from './locales/ru';
import de from './locales/de';

const supportedLangs = ['en', 'ru', 'de'];
const deviceLang = getLocales()[0]?.languageCode ?? 'en';
const fallback = supportedLangs.includes(deviceLang) ? deviceLang : 'en';

// Read persisted language choice synchronously isn't possible, so we init
// with device lang and then immediately apply the saved preference if any.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      de: { translation: de },
    },
    lng: fallback,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Apply saved language override as soon as storage resolves
AsyncStorage.getItem('settings').then((raw) => {
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    const saved: string | null = parsed?.state?.language ?? null;
    if (saved && supportedLangs.includes(saved) && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  } catch {}
});

export { i18n };
