import { createI18n } from 'vue-i18n';

function loadLocaleMessages() {
  const locales = require.context(
    './locales',
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i,
  );
  const messages = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
}

function createAppI18n() {
  return createI18n({
    // Get default locale from local storage
    locale: window.localStorage.getItem('storedLanguage'),
    allowComposition: true,
    globalInjection: true,
    legacy: true,
    // Locales that don't exist will fallback to English
    fallbackLocale: 'en-US',
    // Falling back to fallbackLocale generates two console warnings
    // Silent fallback suppresses console warnings when using fallback
    silentFallbackWarn: true,
    messages: loadLocaleMessages(),
  });
}

const i18n = createAppI18n();

export default i18n;
