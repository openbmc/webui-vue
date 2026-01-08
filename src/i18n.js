import { createI18n } from 'vue-i18n';
import { deepMerge } from './utilities/objectUtils';

// Vite's import.meta.glob for dynamic imports
const baseLocaleModules = import.meta.glob('./locales/**/*.json', {
  eager: true,
});
const envLocaleModules = import.meta.glob('./env/locales/**/*.json', {
  eager: true,
});

export function loadBaseLocaleMessages() {
  const messages = {};
  Object.entries(baseLocaleModules).forEach(([path, mod]) => {
    const match = path.match(/([A-Za-z0-9-_]+)\.json$/i);
    if (!match) return;
    const locale = match[1];
    messages[locale] = mod.default || mod;
  });
  return messages;
}

export function loadEnvLocaleMessages(envName) {
  if (!envName) return {};
  const envMessages = {};
  const vendorRoot = String(envName).split('-')[0];
  const candidates =
    vendorRoot && vendorRoot !== envName ? [vendorRoot, envName] : [envName];

  candidates.forEach((candidate) => {
    Object.entries(envLocaleModules).forEach(([path, mod]) => {
      if (!path.includes(`/${candidate}/`)) return;
      const localeMatch = path.match(/([A-Za-z0-9-_]+)\.json$/i);
      if (!localeMatch) return;
      const locale = localeMatch[1];
      const bundle = mod.default || mod;
      envMessages[locale] = deepMerge(envMessages[locale] || {}, bundle);
    });
  });
  return envMessages;
}

export function createI18nInstance(
  envName,
  locale,
  loadEnv = loadEnvLocaleMessages,
  loadBase = loadBaseLocaleMessages,
) {
  const base = loadBase();
  const env = loadEnv(envName);
  const messages = { ...base };
  Object.keys(env).forEach((loc) => {
    messages[loc] = deepMerge(base[loc] || {}, env[loc]);
  });

  const addAlias = (alias, target) => {
    if (!messages[alias] && messages[target])
      messages[alias] = messages[target];
  };
  addAlias('en', 'en-US');
  addAlias('ru', 'ru-RU');
  addAlias('zh', 'zh-CN');
  addAlias('ka', 'ka-GE');

  const normalize = (val) => {
    if (!val) return undefined;
    const s = String(val);
    if (s === 'en') return 'en-US';
    if (s === 'ru') return 'ru-RU';
    if (s === 'zh') return 'zh-CN';
    if (s === 'ka') return 'ka-GE';
    return s;
  };

  return createI18n({
    locale: normalize(locale),
    // Locales that don't exist will fallback to English
    fallbackLocale: 'en-US',
    // Falling back to fallbackLocale generates two console warnings
    // Silent fallback suppresses console warnings when using fallback
    silentFallbackWarn: true,
    messages,
    globalInjection: true,
    legacy: false,
  });
}

const envName = import.meta.env.VITE_ENV_NAME;
// Get default locale from local storage
const stored = window.localStorage.getItem('storedLanguage');
export default createI18nInstance(envName, stored);
