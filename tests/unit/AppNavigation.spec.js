import { mount } from '@vue/test-utils';
import AppNavigation from '@/components/AppNavigation';
import $store from '@/store';

describe('AppNavigation.vue', () => {
  let wrapper;

  wrapper = mount(AppNavigation, {
    mocks: {
      $t: key => key,
      $store
    }
  });

  beforeEach(() => {});

  describe('Componenet exists', () => {
    it('should check if AppNavigation exists', async () => {
      expect(wrapper.exists());
    });
  });

  describe('AppNavigation methods', () => {
    it('should call toggleIsOpen and toggle isNavigationOpen', async () => {
      wrapper.vm.isNavigationOpen = true;
      wrapper.vm.toggleIsOpen();
      expect(wrapper.vm.isNavigationOpen).to.be.false;
    });
  });
});
