import { createI18n } from 'vue-i18n';
import { deepMerge } from './utilities/objectUtils';

export function loadBaseLocaleMessages() {
  const context = require.context(
    './locales',
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i,
  );
  const messages = {};
  context.keys().forEach((key) => {
    const match = key.match(/([A-Za-z0-9-_]+)\.json$/i);
    if (!match) return;
    const locale = match[1];
    const mod = context(key);
    messages[locale] = mod && mod.default ? mod.default : mod;
  });
  return messages;
}

export function loadEnvLocaleMessages(envName) {
  if (!envName) return {};
  const envMessages = {};
  const envLocales = require.context(
    './env/locales',
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i,
  );
  const vendorRoot = String(envName).split('-')[0];
  const candidates =
    vendorRoot && vendorRoot !== envName ? [vendorRoot, envName] : [envName];
  candidates.forEach((candidate) => {
    envLocales.keys().forEach((key) => {
      if (!key.includes(`/${candidate}/`)) return;
      const localeMatch = key.match(/([A-Za-z0-9-_]+)\.json$/i);
      if (!localeMatch) return;
      const locale = localeMatch[1];
      const mod = envLocales(key);
      const bundle = mod && mod.default ? mod.default : mod;
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

const envName = process.env.VUE_APP_ENV_NAME;
// Get default locale from local storage
const stored = window.localStorage.getItem('storedLanguage');
export default createI18nInstance(envName, stored);
