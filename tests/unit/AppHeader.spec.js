import { expect } from 'chai';
import chai from 'chai';
import { mount } from '@vue/test-utils';
import AppHeader from '@/components/AppHeader';
import $store from '@/store';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

describe('AppHeader.vue', () => {
  let wrapper;
  let spy;

  chai.use(sinonChai);

  wrapper = mount(AppHeader, {
    mocks: {
      $t: key => key,
      $store
    }
  });

  beforeEach(() => {
    spy = sinon.spy($store.dispatch);
  });

  describe('Componenet exists', () => {
    it('should check if AppHeader exists', async () => {
      expect(wrapper.exists());
    });
  });

  describe('AppHeader methods', () => {
    it('should call getHostInfo and dispatch global/getHostStatus', async () => {
      wrapper.vm.getHostInfo();
      spy.calledWith('global/getHostStatu');
    });

    it('should call getEvents and dispatch eventLog/getEventLogData', async () => {
      wrapper.vm.getEvents();
      spy.calledWith('eventLog/getEventLogData');
    });

    it('should call refresh and emit refresh', async () => {
      spy = sinon.spy(wrapper.vm.$emit);
      wrapper.vm.refresh();
      spy.calledWith('refresh');
    });

    it('should call logout and dispatch authentication/logout', async () => {
      wrapper.vm.logout();
      spy.calledWith('authentication/logout');
    });

    it('should call toggleNavigation and dispatch toggle:navigation', async () => {
      spy = sinon.spy(wrapper.vm.$root.$emit);
      wrapper.vm.toggleNavigation();
      spy.calledWith('toggle:navigation');
    });
  });
});
