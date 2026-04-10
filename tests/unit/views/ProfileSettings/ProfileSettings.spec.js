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
    const profileSection = wrapper.find('dl');
    expect(profileSection.exists()).toBe(true);
    expect(wrapper.findAll('dl')).toHaveLength(1);
    expect(profileSection.findAll('dt')).toHaveLength(2);
    expect(profileSection.findAll('dd')).toHaveLength(2);
  });

  it('shows session privilege label and value', () => {
    const terms = wrapper.findAll('dt').map((node) => node.text());
    const values = wrapper.findAll('dd').map((node) => node.text().trim());

    expect(terms).toContain(
      wrapper.vm.$t('pageProfileSettings.sessionPrivilege'),
    );
    expect(values).toContain('Administrator');
  });
});
