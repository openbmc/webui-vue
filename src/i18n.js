import { createI18n } from 'vue-i18n';

function loadLocaleMessages() {
  const locales = import.meta.glob('./locales/*.json', { eager: true });
  const messages = {};
  Object.keys(locales).map((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales[key];
    }
  });
  return messages;
}

const i18n = createI18n({
  legacy: false,
  // Get default locale from local storage
  locale: window.localStorage.getItem('storedLanguage'),
  // Locales that don't exist will fallback to English
  fallbackLocale: 'en-US',
  // Falling back to fallbackLocale generates two console warnings
  // Silent fallback suppresses console warnings when using fallback
  silentFallbackWarn: true,
  messages: loadLocaleMessages(),
});
export default i18n;
