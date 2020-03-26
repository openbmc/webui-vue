import { mount } from '@vue/test-utils';
import AppNavigation from '@/components/AppNavigation';
import Vue from 'vue';
import { BootstrapVue } from 'bootstrap-vue';

describe('AppNavigation.vue', () => {
  let wrapper;
  Vue.use(BootstrapVue);

  wrapper = mount(AppNavigation, {
    mocks: {
      $t: key => key
    }
  });

  describe('Component exists', () => {
    it('should check if AppNavigation exists', async () => {
      expect(wrapper.exists());
    });
  });

  describe('Methods', () => {
    describe('toggleIsOpen method', () => {
      it('should call toggleIsOpen and toggle isNavigationOpen to false', async () => {
        wrapper.vm.isNavigationOpen = true;
        wrapper.vm.toggleIsOpen();
        expect(wrapper.vm.isNavigationOpen).to.be.false;
      });

      it('should call toggleIsOpen and toggle isNavigationOpen to true', async () => {
        wrapper.vm.isNavigationOpen = false;
        wrapper.vm.toggleIsOpen();
        expect(wrapper.vm.isNavigationOpen).to.be.true;
      });
    });
  });
});
