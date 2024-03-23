import { createI18n } from 'vue-i18n';

import en_us from './locales/en-US.json';
import ru_ru from './locales/ru-RU.json';

function loadLocaleMessages() {
  const messages = {
    'en-US': en_us,
    'ru-RU': ru_ru,
  };
  return messages;
}

const i18n = createI18n({
  // Get default locale from local storage
  locale: window.localStorage.getItem('storedLanguage'),
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
