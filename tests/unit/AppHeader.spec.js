import { shallowMount, createLocalVue, createWrapper } from '@vue/test-utils';
import Vue from 'vue';
import Vuex from 'vuex';
import AppHeader from '@/components/AppHeader';

// Silencing warnings about undefined Bootsrap-vue components
Vue.config.silent = true;
const localVue = createLocalVue();
localVue.use(Vuex);

describe('AppHeader.vue', () => {
  const actions = {
    // 'global/getHostStatus': sinon.spy(),
    // 'eventLog/getEventLogData': sinon.spy()
  };

  const store = new Vuex.Store({ actions });
  const wrapper = shallowMount(AppHeader, {
    store,
    localVue,
    mocks: {
      $t: key => key
    }
  });

  // Reset spy for each test. Otherwise mutiple actions
  // are dispatched in each test
  beforeEach(() => {
    store.dispatch = sinon.spy();
  });

  describe('UI', () => {
    it('should check if AppHeader exists', () => {
      expect(wrapper.exists()).to.be.true;
    });

    it('should check if the skip navigation link exists', () => {
      expect(wrapper.get('.link-skip-nav').exists()).to.be.true;
    });

    it('refresh button click should emit refresh event', async () => {
      wrapper.get('#app-header-refresh').trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted().refresh).to.exist;
    });

    it('nav-trigger button click should emit toggle:navigation event', async () => {
      const rootWrapper = createWrapper(wrapper.vm.$root);
      wrapper.get('#app-header-trigger').trigger('click');
      await wrapper.vm.$nextTick();
      expect(rootWrapper.emitted()['toggle:navigation']).to.exist;
    });

    it('logout button should dispatch authentication/logout', async () => {
      wrapper.get('#app-header-logout').trigger('click');
      await wrapper.vm.$nextTick();
      expect(store.dispatch).calledWith('authentication/logout');
    });
  });

  describe('Methods', () => {
    it('getHostInfo should dispatch global/getHostStatus', () => {
      wrapper.vm.getHostInfo();
      expect(store.dispatch).calledWith('global/getHostStatus');
    });

    it('getEvents should dispatch eventLog/getEventLogData', () => {
      wrapper.vm.getEvents();
      expect(store.dispatch).calledWith('eventLog/getEventLogData');
    });
  });
});
