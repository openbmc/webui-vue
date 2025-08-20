import { createI18n } from 'vue-i18n';

import en_us from './locales/en-US.json';
import ru_ru from './locales/ru-RU.json';
import ka_ge from './locales/ka-GE.json';

function loadLocaleMessages() {
  const messages = {
    'en-US': en_us,
    'ka-GE': ka_ge,
    'ru-RU': ru_ru,
    // Aliases for common short codes so we still resolve if a short code is stored
    en: en_us,
    ru: ru_ru,
    ka: ka_ge,
  };
  return messages;
}

// Normalize any stored locale to one we support; default to 'en-US'
const stored = window.localStorage.getItem('storedLanguage');
const normalizedLocale =
  stored && ['en-US', 'ru-RU', 'ka-GE', 'en', 'ru', 'ka'].includes(stored)
    ? stored
    : 'en-US';

const i18n = createI18n({
  // Get default locale from local storage (normalized)
  locale: normalizedLocale,
  // Locales that don't exist will fallback to English
  fallbackLocale: 'en-US',
  // Falling back to fallbackLocale generates two console warnings
  // Silent fallback suppresses console warnings when using fallback
  silentFallbackWarn: true,
  messages: loadLocaleMessages(),
  globalInjection: false,
  legacy: false,
});

export default i18n;
