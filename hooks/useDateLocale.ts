import { useTranslation } from 'react-i18next';
import type { Locale } from 'date-fns';
import { enUS, ru, de, fr, es, pt, it, nl, pl, tr, ja, ko, zhCN, ar, hi, sv, da, fi, uk } from 'date-fns/locale';

const LOCALE_MAP: Record<string, Locale> = {
  en: enUS,
  ru,
  de,
  fr,
  es,
  pt,
  it,
  nl,
  pl,
  tr,
  ja,
  ko,
  zh: zhCN,
  ar,
  hi,
  sv,
  da,
  fi,
  uk,
};

export function useDateLocale(): Locale {
  const { i18n } = useTranslation();
  return LOCALE_MAP[i18n.language] ?? enUS;
}
