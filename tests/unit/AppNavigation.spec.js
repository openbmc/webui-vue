import { mount, createWrapper } from '@vue/test-utils';
import AppNavigation from '@/components/AppNavigation';
import Vue from 'vue';
import VueRouter from 'vue-router';
import { BootstrapVue } from 'bootstrap-vue';

describe('AppNavigation.vue', () => {
  let wrapper;
  Vue.use(BootstrapVue);
  Vue.use(VueRouter);
  const router = new VueRouter();

  wrapper = mount(AppNavigation, {
    router,
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
    const rootWrapper = createWrapper(wrapper.vm.$root);
    const navOverlay = wrapper.find('#nav-overlay');
    navOverlay.trigger('click');
    await wrapper.vm.$nextTick();
    expect(rootWrapper.emitted('change-is-navigation-open')).toBeTruthy();
  });

  it('toggle-navigation event should toggle isNavigation data prop value', async () => {
    const rootWrapper = createWrapper(wrapper.vm.$root);
    wrapper.vm.isNavigationOpen = false;
    rootWrapper.vm.$emit('toggle-navigation');
    expect(wrapper.vm.isNavigationOpen).toBe(true);
    rootWrapper.vm.$emit('toggle-navigation');
    expect(wrapper.vm.isNavigationOpen).toBe(false);
  });
});
