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
  addAlias('ka', 'ka-GE');

  const normalize = (val) => {
    if (!val) return undefined;
    const s = String(val);
    if (s === 'en') return 'en-US';
    if (s === 'ru') return 'ru-RU';
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

/**
 * Build a {value, text} list for a language picker from a set of locale codes.
 * Drops bare-language aliases (those without a region suffix) so each language
 * only appears once. Label format: "{English name} - {Native name}".
 * When English and native names are identical (e.g. en-US → "English"),
 * the region code is used as a prefix instead (e.g. "US - English").
 */
export function getAvailableLanguages(locales) {
  return (locales || [])
    .filter((loc) => loc.includes('-'))
    .map((loc) => {
      const intlLocale = new Intl.Locale(loc);
      const language = intlLocale.language;
      const region = intlLocale.region;

      let englishName = loc;
      let nativeName = loc;

      try {
        englishName = new Intl.DisplayNames(['en-US'], { type: 'language' }).of(language);
      } catch {
        englishName = loc;
      }

      try {
        const raw = new Intl.DisplayNames([loc], { type: 'language' }).of(language);
        nativeName = raw
          ? raw.charAt(0).toLocaleUpperCase(loc) + raw.slice(1)
          : loc;
      } catch {
        nativeName = loc;
      }

      // If English and native names are the same (e.g. "English" / "English"),
      // prefix with region code to disambiguate (e.g. "US - English").
      const text =
        englishName && nativeName && englishName !== nativeName
          ? `${englishName} - ${nativeName}`
          : region
            ? `${region} - ${englishName}`
            : englishName || loc;

      return { value: loc, text };
    })
    .sort((a, b) => a.value.localeCompare(b.value));
}

/**
 * Derive a translated page title from a route object.
 * Converts kebab-case route name to camelCase and looks up
 * the appPageTitle.{camelCaseName} i18n key. Falls back to
 * route.meta.title, route name, or the provided fallback string.
 */
export function getRoutePageTitle(route, t, te, fallback = '') {
  const routeName = route.name;
  if (routeName) {
    const camelCaseName = routeName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const translationKey = `appPageTitle.${camelCaseName}`;
    if (te(translationKey)) {
      return t(translationKey);
    }
  }
  return route.meta?.title || routeName || fallback;
}

const envName = import.meta.env.VITE_ENV_NAME;
// Get default locale from local storage
const stored = window.localStorage.getItem('storedLanguage');
export default createI18nInstance(envName, stored);
