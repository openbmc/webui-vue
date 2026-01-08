import { mount } from '@vue/test-utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import eventBus from '@/eventBus';
import { createStore } from 'vuex';
import AppHeader from '@/components/AppHeader';

describe('AppHeader.vue', () => {
  const actions = {
    'global/getServerStatus': vi.fn(),
    'eventLog/getEventLogData': vi.fn(),
    'authentication/resetStoreState': vi.fn(),
    'global/getSystemInfo': vi.fn(),
  };

  // VueX requires that all modules be present, even if they aren't used
  // in the test, so invent a Fake auth module and install it.
  const modules = {
    authentication: {
      namespaced: true,
    },
  };

  const store = createStore({
    actions,
    modules,
    getters: {
      'global/assetTag': () => '',
      'global/modelType': () => '',
      'global/serialNumber': () => '',
      'global/isAuthorized': () => true,
      'global/userPrivilege': () => '',
      'global/serverStatus': () => '',
      'global/username': () => '',
    },
  });
  const wrapper = mount(AppHeader, {
    global: { plugins: [store] },
    mocks: {
      $t: (key) => key,
    },
  });

  // Reset dispatch between tests so that multiple
  // actions are not dispatched for each test
  beforeEach(() => {
    store.dispatch = vi.fn();
  });

  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('refresh button click should emit refresh event', async () => {
    wrapper.get('#app-header-refresh').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('refresh')).toBeTruthy();
  });

  it('nav-trigger button click should emit toggle-navigation event', async () => {
    const spy = vi.spyOn(eventBus, '$emit');
    wrapper.get('#app-header-trigger').trigger('click');
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalledWith('toggle-navigation');
  });

  it('logout button should dispatch authentication/logout', async () => {
    wrapper.get('[data-test-id="appHeader-link-logout"]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });

  it('change:isNavigationOpen event should set isNavigationOpen prop to false', async () => {
    eventBus.$emit('change-is-navigation-open', false);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isNavigationOpen).toEqual(false);
  });

  describe('Created lifecycle hook', () => {
    it('getSystemInfo should dispatch global/getSystemInfo', () => {
      wrapper.vm.getSystemInfo();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('getEvents should dispatch eventLog/getEventLogData', () => {
      wrapper.vm.getEvents();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });
  });
});
