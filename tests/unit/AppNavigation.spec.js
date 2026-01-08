import { mount } from '@vue/test-utils';
import { vi, describe, it, expect } from 'vitest';
import eventBus from '@/eventBus';
import AppNavigation from '@/components/AppNavigation';
import Vuex from 'vuex';
// Router is stubbed via vitest.setup; avoid importing history creator that may not exist

describe('AppNavigation.vue', () => {
  let wrapper;
  const actions = {
    'global/userPrivilege': vi.fn(),
  };
  const store = new Vuex.Store({ actions });
  wrapper = mount(AppNavigation, {
    global: { plugins: [store] },
    mocks: {
      $t: (key) => key,
    },
  });

  it('should exist', async () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render with nav-container open', () => {
    wrapper.vm.isNavigationOpen = true;
    expect(wrapper.element).toMatchSnapshot();
  });

  it('Nav Overlay click should emit change-is-navigation-open event', async () => {
    const spy = vi.spyOn(eventBus, '$emit');
    const navOverlay = wrapper.find('#nav-overlay');
    navOverlay.trigger('click');
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalledWith('change-is-navigation-open', false);
  });

  it('toggle-navigation event should toggle isNavigation data prop value', async () => {
    wrapper.vm.isNavigationOpen = false;
    eventBus.$emit('toggle-navigation');
    expect(wrapper.vm.isNavigationOpen).toBe(true);
    eventBus.$emit('toggle-navigation');
    expect(wrapper.vm.isNavigationOpen).toBe(false);
  });
});
