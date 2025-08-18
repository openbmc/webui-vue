/* eslint-env jest */
import { config } from '@vue/test-utils';

// Make Math.random deterministic for stable snapshots (e.g., IDs in components)
jest.spyOn(Math, 'random').mockReturnValue(0.123456789);

// Mock vue-i18n APIs used in app/components
jest.mock('vue-i18n', () => ({
  createI18n: () => ({ global: { t: (k) => k } }),
  useI18n: () => ({ t: (k) => k }),
}));

// Provide a minimal vue-router API for tests that import it
jest.mock('vue-router', () => ({
  createRouter: () => ({}),
  createMemoryHistory: () => ({}),
}));

// Provide default global mocks/stubs
config.global.mocks = {
  $t: (k) => k,
  $route: { meta: { title: '' } },
};

config.global.stubs = {
  'router-link': { template: '<a><slot/></a>' },
  // Commonly used BootstrapVue components in tests (use native tags to avoid recursion)
  'b-navbar': { template: '<nav><slot/></nav>' },
  'b-navbar-brand': { template: '<div><slot/></div>' },
  'b-navbar-nav': { template: '<div><slot/></div>' },
  'b-dropdown': { template: '<div><slot/></div>' },
  'b-dropdown-item': { template: '<div><slot/></div>' },
  'b-nav': { template: '<ul class="nav mb-4 flex-column"><slot/></ul>' },
  'b-nav-item': { template: '<li><slot/></li>' },
  'b-collapse': { template: '<ul><slot/></ul>' },
  'b-button': {
    name: 'b-button',
    template: '<button><slot/></button>',
  },
  'b-input-group': { template: '<div class="input-group"><slot/></div>' },
  'b-input-group-prepend': {
    template: '<div class="input-group-prepend"><slot/></div>',
  },
  'b-form-group': { template: '<div class="form-group mb-2"><slot/></div>' },
  'b-form-input': {
    template: '<input class="form-control search-input" />',
  },
  'b-progress': { template: '<div class="progress"><slot/></div>' },
  'b-progress-bar': { template: '<div class="progress-bar"></div>' },
};

// Provide a minimal $root with $on/$emit via plugin to avoid proxy set issues
config.global.plugins = [
  {
    install(app) {
      // Add $on/$emit on root and any component instance that needs it
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

// Stub bootstrap-vue tooltip directive
config.global.directives = {
  'b-tooltip': () => {},
  'b-toggle': () => {},
};
