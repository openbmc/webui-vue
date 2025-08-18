/* eslint-env jest */
import { config } from '@vue/test-utils';

// Make Math.random deterministic for stable snapshots (e.g., IDs in components)
jest.spyOn(Math, 'random').mockReturnValue(0.123456789);

// Provide a minimal vue-router API for tests that import it
jest.mock('vue-router', () => ({
  createRouter: () => ({}),
  createMemoryHistory: () => ({}),
}));

// Create a shared i18n instance for component tests
// This provides a working i18n plugin for components that use useI18n()
import { createI18n } from 'vue-i18n';
import enUS from '@/locales/en-US.json';

// Mock the default export of @/i18n to provide a working i18n instance.
// In Jest, require.context doesn't work, so the real module would have no messages.
// Note: The i18n.*.spec.js tests use jest.unmock('@/i18n') to test the real module.
jest.mock('@/i18n', () => {
  const { createI18n: create } = require('vue-i18n');
  // eslint-disable-next-line global-require
  const messages = require('@/locales/en-US.json');
  const mockI18n = create({
    legacy: false,
    locale: 'en-US',
    fallbackLocale: 'en-US',
    globalInjection: true,
    messages: {
      'en-US': messages.default || messages,
      en: messages.default || messages,
    },
  });

  // Re-export the real named exports for tests that need them
  // eslint-disable-next-line global-require
  const actual = jest.requireActual('@/i18n');
  return {
    __esModule: true,
    default: mockI18n,
    loadBaseLocaleMessages: actual.loadBaseLocaleMessages,
    loadEnvLocaleMessages: actual.loadEnvLocaleMessages,
    createI18nInstance: actual.createI18nInstance,
  };
});

export const testI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  globalInjection: true,
  messages: {
    'en-US': enUS,
    en: enUS, // Alias for linked message resolution
  },
});

// Provide default global mocks/stubs
config.global.mocks = {
  $t: (k) => k,
  $route: { meta: { title: '' } },
  $eventBus: {
    on: () => {},
    off: () => {},
    emit: () => {},
    $on: () => {},
    $off: () => {},
    $emit: () => {},
  },
};

// Stubs with single root elements to properly inherit attributes like data-test-id
config.global.stubs = {
  'router-link': { template: '<a><slot/></a>' },
  'b-navbar': { template: '<nav><slot/></nav>' },
  'b-navbar-brand': { template: '<div><slot/></div>' },
  'b-navbar-nav': { template: '<div><slot/></div>' },
  'b-dropdown': { template: '<div><slot/></div>' },
  'b-dropdown-item': { template: '<div><slot/></div>' },
  'b-nav': { template: '<ul class="nav mb-4 flex-column"><slot/></ul>' },
  'b-nav-item': { template: '<li><slot/></li>' },
  'b-collapse': { template: '<ul><slot/></ul>' },
  'b-button': { template: '<button><slot/></button>' },
  'b-input-group': { template: '<div class="input-group"><slot/></div>' },
  'b-input-group-prepend': {
    template: '<div class="input-group-prepend"><slot/></div>',
  },
  'b-input-group-text': {
    template: '<span class="input-group-text"><slot/></span>',
  },
  'b-form-group': { template: '<div class="form-group mb-2"><slot/></div>' },
  'b-form-input': { template: '<input class="form-control search-input" />' },
  'b-form-checkbox': { template: '<div class="form-check"><slot/></div>' },
  'b-form-radio': { template: '<div class="form-check"><slot/></div>' },
  'b-form-select': { template: '<select><slot/></select>' },
  'b-progress': { template: '<div class="progress"><slot/></div>' },
  'b-progress-bar': { template: '<div class="progress-bar"></div>' },
  'b-modal': { template: '<div class="modal"><slot/></div>' },
  'b-tooltip': { template: '<div><slot/></div>' },
};

// Provide plugins - i18n for useI18n() support, and $root helpers
config.global.plugins = [
  testI18n,
  {
    install(app) {
      // eslint-disable-next-line no-param-reassign
      app.config.globalProperties.$root =
        app.config.globalProperties.$root || {};
      if (!app.config.globalProperties.$root.$on) {
        app.config.globalProperties.$root.$on = () => {};
      }
      if (!app.config.globalProperties.$root.$emit) {
        app.config.globalProperties.$root.$emit = () => {};
      }
      app.mixin({
        beforeCreate() {
          const r = this.$root;
          if (r && !r.$on) r.$on = () => {};
          if (r && !r.$emit) r.$emit = () => {};
        },
      });
    },
  },
];

// Stub bootstrap-vue directives
config.global.directives = {
  'b-tooltip': () => {},
  'b-toggle': () => {},
};
