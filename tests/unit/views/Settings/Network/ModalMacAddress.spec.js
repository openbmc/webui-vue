import { mount } from '@vue/test-utils';
import ModalMacAddress from '@/views/Settings/Network/ModalMacAddress';
import { bootstrapStubs, createModalStub } from '../../../testUtils';

describe('ModalMacAddress.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ModalMacAddress, {
      props: {
        modelValue: true,
        macAddress: '',
      },
      global: {
        stubs: {
          ...bootstrapStubs,
          'b-modal': createModalStub(),
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  describe('Vuelidate v2 integration', () => {
    it('should have v$ vuelidate object defined', () => {
      expect(wrapper.vm.v$).toBeDefined();
    });

    it('should have form.macAddress validations defined', () => {
      expect(wrapper.vm.v$.form).toBeDefined();
      expect(wrapper.vm.v$.form.macAddress).toBeDefined();
    });

    it('should have required validator for macAddress', () => {
      expect(wrapper.vm.v$.form.macAddress.required).toBeDefined();
    });

    it('should have custom macAddress validator', () => {
      expect(wrapper.vm.v$.form.macAddress.macAddress).toBeDefined();
    });

    it('should start with clean validation state', () => {
      expect(wrapper.vm.v$.form.macAddress.$dirty).toBe(false);
    });

    it('should become dirty after $touch is called', async () => {
      wrapper.vm.v$.form.macAddress.$touch();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.v$.form.macAddress.$dirty).toBe(true);
    });

    it('should reset dirty state when $reset is called', async () => {
      wrapper.vm.v$.form.macAddress.$touch();
      await wrapper.vm.$nextTick();

      wrapper.vm.v$.$reset();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.v$.form.macAddress.$dirty).toBe(false);
    });
  });

  describe('VuelidateMixin integration', () => {
    it('should have getValidationState method from mixin', () => {
      expect(typeof wrapper.vm.getValidationState).toBe('function');
    });

    it('getValidationState should return null when not dirty', () => {
      const result = wrapper.vm.getValidationState(
        wrapper.vm.v$.form.macAddress,
      );
      expect(result).toBe(null);
    });
  });

  describe('Form methods', () => {
    it('should have handleSubmit method', () => {
      expect(typeof wrapper.vm.handleSubmit).toBe('function');
    });

    it('should have resetForm method', () => {
      expect(typeof wrapper.vm.resetForm).toBe('function');
    });

    it('resetForm should reset validation state', async () => {
      wrapper.vm.form.macAddress = '00:1A:2B:3C:4D:5E';
      wrapper.vm.v$.form.macAddress.$touch();
      await wrapper.vm.$nextTick();

      wrapper.vm.resetForm();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.v$.form.macAddress.$dirty).toBe(false);
    });
  });

  describe('Custom MAC address validator (helpers.regex)', () => {
    it('should use helpers.regex for custom validation', () => {
      // Verify the validator is a function created by helpers.regex
      const validator = wrapper.vm.v$.form.macAddress.macAddress;
      expect(validator).toBeDefined();
      expect(validator.$params).toBeDefined();
    });
  });
});
