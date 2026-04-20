import { useTranslation } from 'react-i18next';
import type en from '@/i18n/locales/en';

// Typed wrapper — autocomplete works on all translation keys
export function useT() {
  const { t, i18n } = useTranslation();
  return { t: t as (key: NestedKeyOf<typeof en>, opts?: Record<string, unknown>) => string, i18n };
}

// Utility: extracts all dot-separated keys from a nested object type
type NestedKeyOf<T extends object> = {
  [K in keyof T & string]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K] & object>}`
    : K;
}[keyof T & string];
