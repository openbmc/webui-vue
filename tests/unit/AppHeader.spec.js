import { mount, createLocalVue, createWrapper } from '@vue/test-utils';
import Vue from 'vue';
import Vuex from 'vuex';
import AppHeader from '@/components/AppHeader';
import WebSocketMock from '@/mock/server/WebSocketServer';
import WebSocketPlugin from '@/store/plugins/WebSocketPlugin';

// Silencing warnings about undefined Bootsrap-vue components
Vue.config.silent = true;
const localVue = createLocalVue();
localVue.use(Vuex);

describe('AppHeader.vue', () => {
  const actions = {
    'global/getServerStatus': jest.fn(),
    'eventLog/getEventLogData': jest.fn(),
    'authentication/resetStoreState': jest.fn(),
    'global/dispatchWebSocketData': jest.fn(),
  };
  const mutations = {
    'authentication/authSuccess': jest.fn(),
  };
  const plugins = [WebSocketPlugin];

  const store = new Vuex.Store({ actions, mutations, plugins });
  const wrapper = mount(AppHeader, {
    store,
    localVue,
    mocks: {
      $t: (key) => key,
    },
  });

  // Reset dispatch between tests so that multiple
  // actions are not dispatched for each test
  beforeEach(() => {
    store.dispatch = jest.fn();
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
    const rootWrapper = createWrapper(wrapper.vm.$root);
    wrapper.get('#app-header-trigger').trigger('click');
    await wrapper.vm.$nextTick();
    expect(rootWrapper.emitted('toggle-navigation')).toBeTruthy();
  });

  it('logout button should dispatch authentication/logout', async () => {
    wrapper.get('[data-test-id="appHeader-link-logout"]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });

  it('change:isNavigationOpen event should set isNavigationOpen prop to false', async () => {
    const rootWrapper = createWrapper(wrapper.vm.$root);
    rootWrapper.vm.$emit('change-is-navigation-open', false);
    await rootWrapper.vm.$nextTick();
    expect(wrapper.vm.isNavigationOpen).toEqual(false);
  });

  describe('Created lifecycle hook', () => {
    it('getServerInfo should dispatch global/getServerStatus', () => {
      wrapper.vm.getServerInfo();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('getEvents should dispatch eventLog/getEventLogData', () => {
      wrapper.vm.getEvents();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('WebSocketPlugin', () => {
    it('onmessage should dispatch global/dispatchWebSocketData', (done) => {
      jest.useFakeTimers();
      const mockServer = WebSocketMock('ws://localhost:1234/subscribe');
      store.commit('authentication/authSuccess');
      expect(mutations['authentication/authSuccess']).toBeCalled();
      jest.runAllTimers();
      expect(store.dispatch).toBeCalled();
      mockServer.stop(done);
    });
  });
});
