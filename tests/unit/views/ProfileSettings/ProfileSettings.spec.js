import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { vi } from 'vitest';
import ProfileSettings from '@/views/ProfileSettings';
import { bootstrapStubs } from '../../testUtils';

describe('ProfileSettings.vue', () => {
  let wrapper;
  let getAccountSettings;

  beforeEach(async () => {
    getAccountSettings = vi.fn(() => Promise.resolve());

    const store = createStore({
      modules: {
        global: {
          namespaced: true,
          getters: {
            username: () => 'admin',
            userPrivilege: () => 'Administrator',
            isUtcDisplay: () => true,
          },
        },
        userManagement: {
          namespaced: true,
          getters: {
            accountPasswordRequirements: () => ({
              minLength: 8,
              maxLength: 20,
            }),
          },
          actions: {
            getAccountSettings,
          },
        },
      },
    });

    wrapper = mount(ProfileSettings, {
      global: {
        plugins: [store],
        mocks: {
          $filters: {
            shortTimeZone: () => 'UTC',
          },
        },
        stubs: {
          ...bootstrapStubs,
          'input-password-toggle': {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    await wrapper.vm.$nextTick();
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  it('loads account settings on create', () => {
    expect(getAccountSettings).toHaveBeenCalledTimes(1);
  });

  it('renders one profile info description list with two terms and values', () => {
    const profileSection = wrapper.find(
      '[data-test-id="profileSettings-list-profileInfo"]',
    );
    const usernameLabel = wrapper.find(
      '[data-test-id="profileSettings-label-username"]',
    );
    const usernameValue = wrapper.find(
      '[data-test-id="profileSettings-value-username"]',
    );

    expect(profileSection.exists()).toBe(true);
    expect(usernameLabel.exists()).toBe(true);
    expect(usernameValue.exists()).toBe(true);
    expect(wrapper.findAll('[data-test-id="profileSettings-list-profileInfo"]')).toHaveLength(1);
    expect(profileSection.findAll('dt')).toHaveLength(2);
    expect(profileSection.findAll('dd')).toHaveLength(2);
    expect(usernameLabel.text()).toBe(wrapper.vm.$t('pageProfileSettings.username'));
    expect(usernameValue.text().trim()).toBe('admin');
  });

  it('shows fallback text when username is null', async () => {
    const store = createStore({
      modules: {
        global: {
          namespaced: true,
          getters: {
            username: () => null,
            userPrivilege: () => 'Administrator',
            isUtcDisplay: () => true,
          },
        },
        userManagement: {
          namespaced: true,
          getters: {
            accountPasswordRequirements: () => ({
              minLength: 8,
              maxLength: 20,
            }),
          },
          actions: {
            getAccountSettings: vi.fn(() => Promise.resolve()),
          },
        },
      },
    });

    const localWrapper = mount(ProfileSettings, {
      global: {
        plugins: [store],
        mocks: {
          $filters: {
            shortTimeZone: () => 'UTC',
          },
        },
        stubs: {
          ...bootstrapStubs,
          'input-password-toggle': {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    await localWrapper.vm.$nextTick();

    const value = localWrapper.find(
      '[data-test-id="profileSettings-value-username"]',
    );

    expect(value.text().trim()).toBe(localWrapper.vm.$t('global.status.notAvailable'));

    localWrapper.unmount();
  });

  it('shows session privilege label and value', () => {
    const label = wrapper.find(
      '[data-test-id="profileSettings-label-sessionPrivilege"]',
    );
    const value = wrapper.find(
      '[data-test-id="profileSettings-value-sessionPrivilege"]',
    );

    expect(label.exists()).toBe(true);
    expect(value.exists()).toBe(true);
    expect(label.text()).toBe(wrapper.vm.$t('pageProfileSettings.sessionPrivilege'));
    expect(value.text().trim()).toBe('Administrator');
  });

  it('shows fallback text when session privilege is null', async () => {
    const store = createStore({
      modules: {
        global: {
          namespaced: true,
          getters: {
            username: () => 'admin',
            userPrivilege: () => null,
            isUtcDisplay: () => true,
          },
        },
        userManagement: {
          namespaced: true,
          getters: {
            accountPasswordRequirements: () => ({
              minLength: 8,
              maxLength: 20,
            }),
          },
          actions: {
            getAccountSettings: vi.fn(() => Promise.resolve()),
          },
        },
      },
    });

    const localWrapper = mount(ProfileSettings, {
      global: {
        plugins: [store],
        mocks: {
          $filters: {
            shortTimeZone: () => 'UTC',
          },
        },
        stubs: {
          ...bootstrapStubs,
          'input-password-toggle': {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    await localWrapper.vm.$nextTick();

    const value = localWrapper.find(
      '[data-test-id="profileSettings-value-sessionPrivilege"]',
    );

    expect(value.text().trim()).toBe(localWrapper.vm.$t('global.status.notAvailable'));

    localWrapper.unmount();
  });

  it('shows fallback text when session privilege is undefined', async () => {
    const store = createStore({
      modules: {
        global: {
          namespaced: true,
          getters: {
            username: () => 'admin',
            userPrivilege: () => undefined,
            isUtcDisplay: () => true,
          },
        },
        userManagement: {
          namespaced: true,
          getters: {
            accountPasswordRequirements: () => ({
              minLength: 8,
              maxLength: 20,
            }),
          },
          actions: {
            getAccountSettings: vi.fn(() => Promise.resolve()),
          },
        },
      },
    });

    const localWrapper = mount(ProfileSettings, {
      global: {
        plugins: [store],
        mocks: {
          $filters: {
            shortTimeZone: () => 'UTC',
          },
        },
        stubs: {
          ...bootstrapStubs,
          'input-password-toggle': {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    await localWrapper.vm.$nextTick();

    const value = localWrapper.find(
      '[data-test-id="profileSettings-value-sessionPrivilege"]',
    );

    expect(value.text().trim()).toBe(localWrapper.vm.$t('global.status.notAvailable'));

    localWrapper.unmount();
  });
});
