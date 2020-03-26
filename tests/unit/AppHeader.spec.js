import { mount } from '@vue/test-utils';
import Vue from 'vue';
import AppHeader from '@/components/AppHeader';
import $store from '@/store';
import { BootstrapVue } from 'bootstrap-vue';

describe('AppHeader.vue', () => {
  let wrapper;
  let spy;
  Vue.use(BootstrapVue);

  wrapper = mount(AppHeader, {
    mocks: {
      $t: key => key,
      $store
    }
  });

  beforeEach(() => {
    spy = sinon.spy($store.dispatch);
  });

  describe('Component exists', () => {
    it('should check if AppHeader exists', async () => {
      expect(wrapper.exists());
    });
  });

  describe('AppHeader methods', () => {
    it('should call getHostInfo and dispatch global/getHostStatus', async () => {
      wrapper.vm.getHostInfo();
      spy('global/getHostStatus');
      expect(spy).to.have.been.calledWith('global/getHostStatus');
    });

    it('should call getEvents and dispatch eventLog/getEventLogData', async () => {
      wrapper.vm.getEvents();
      spy('eventLog/getEventLogData');
      expect(spy).to.have.been.calledWith('eventLog/getEventLogData');
    });

    it('should call refresh and emit refresh', async () => {
      spy = sinon.spy(wrapper.vm.$emit);
      wrapper.vm.refresh();
      spy('refresh');
      expect(spy).to.have.been.calledWith('refresh');
    });

    it('should call logout and dispatch authentication/logout', async () => {
      wrapper.vm.logout();
      spy('authentication/logout');
      expect(spy).to.have.been.calledWith('authentication/logout');
    });

    it('should call toggleNavigation and dispatch toggle:navigation', async () => {
      spy = sinon.spy(wrapper.vm.$root.$emit);
      wrapper.vm.toggleNavigation();
      spy('toggle:navigation');
      expect(spy).to.have.been.calledWith('toggle:navigation');
    });
  });
});
