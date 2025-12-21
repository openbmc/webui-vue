import { mount } from '@vue/test-utils';
import ModalHostname from '@/views/Settings/Network/ModalHostname';
import { createTestI18n, bootstrapStubs, createModalStub } from '../../../testUtils';

describe('ModalHostname.vue', () => {
  let wrapper;
  const i18n = createTestI18n();

  beforeEach(() => {
    wrapper = mount(ModalHostname, {
      props: {
        modelValue: true,
        hostname: '',
      },
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key) => key,
        },
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

    it('should have form validations defined', () => {
      expect(wrapper.vm.v$.form).toBeDefined();
      expect(wrapper.vm.v$.form.hostname).toBeDefined();
    });

    it('should have required validator for hostname', () => {
      expect(wrapper.vm.v$.form.hostname.required).toBeDefined();
    });

    it('should have validateHostname validator', () => {
      expect(wrapper.vm.v$.form.hostname.validateHostname).toBeDefined();
    });

    it('should have $touch method on validators', () => {
      expect(typeof wrapper.vm.v$.form.hostname.$touch).toBe('function');
    });

    it('should have $reset method on validators', () => {
      expect(typeof wrapper.vm.v$.$reset).toBe('function');
    });

    it('should start with clean validation state', () => {
      expect(wrapper.vm.v$.form.hostname.$dirty).toBe(false);
    });

    it('should become dirty after $touch is called', async () => {
      wrapper.vm.v$.form.hostname.$touch();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.v$.form.hostname.$dirty).toBe(true);
    });

    it('should reset dirty state when $reset is called', async () => {
      wrapper.vm.v$.form.hostname.$touch();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.v$.form.hostname.$dirty).toBe(true);

      wrapper.vm.v$.$reset();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.v$.form.hostname.$dirty).toBe(false);
    });
  });

  describe('VuelidateMixin integration', () => {
    it('should have getValidationState method from mixin', () => {
      expect(typeof wrapper.vm.getValidationState).toBe('function');
    });

    it('getValidationState should return null when not dirty', () => {
      const result = wrapper.vm.getValidationState(wrapper.vm.v$.form.hostname);
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
      wrapper.vm.form.hostname = 'test-hostname';
      wrapper.vm.v$.form.hostname.$touch();
      await wrapper.vm.$nextTick();

      wrapper.vm.resetForm();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.v$.form.hostname.$dirty).toBe(false);
    });
  });
});
