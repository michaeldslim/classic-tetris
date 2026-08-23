import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { en } from './locales/en';
import { ko } from './locales/ko';

export type AppLanguage = 'ko' | 'en';

const i18n = new I18n({ en, ko });
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export function detectDeviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode;
  return code === 'ko' ? 'ko' : 'en';
}

export function setI18nLanguage(language: AppLanguage) {
  i18n.locale = language;
}

export function t(scope: string, options?: Record<string, string | number>) {
  return i18n.t(scope, options);
}
