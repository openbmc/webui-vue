import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { createI18n } from 'vue-i18n';
import ModalUser from '@/views/SecurityAndAccess/UserManagement/ModalUser';
import { bootstrapStubs, createModalStub } from '../../../testUtils';

describe('ModalUser.vue', () => {
  let wrapper;
  let store;
  let i18n;

  const passwordRequirements = {
    minLength: 8,
    maxLength: 20,
  };

  beforeEach(() => {
    i18n = createI18n({
      legacy: false,
      locale: 'en-US',
      fallbackLocale: 'en-US',
      silentFallbackWarn: true,
      messages: { 'en-US': {} },
    });

    store = createStore({
      modules: {
        global: {
          namespaced: true,
          getters: {
            username: () => 'admin',
          },
        },
        userManagement: {
          namespaced: true,
          getters: {
            accountSettings: () => ({
              accountLockoutDuration: 0,
            }),
            accountRoles: () => [
              { value: 'Administrator', text: 'Administrator' },
              { value: 'Operator', text: 'Operator' },
              { value: 'ReadOnly', text: 'ReadOnly' },
            ],
          },
        },
      },
    });

    wrapper = mount(ModalUser, {
      props: {
        passwordRequirements,
        modelValue: true,
      },
      global: {
        plugins: [store, i18n],
        mocks: {
          $t: (key) => key,
        },
        stubs: {
          ...bootstrapStubs,
          'b-modal': createModalStub(),
          Alert: true,
          InputPasswordToggle: {
            template: '<div><slot /></div>',
          },
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
    });

    it('should have username validation with required', () => {
      expect(wrapper.vm.v$.form.username).toBeDefined();
      expect(wrapper.vm.v$.form.username.required).toBeDefined();
    });

    it('should have username validation with maxLength', () => {
      expect(wrapper.vm.v$.form.username.maxLength).toBeDefined();
    });

    it('should have username validation with pattern (helpers.regex)', () => {
      expect(wrapper.vm.v$.form.username.pattern).toBeDefined();
    });

    it('should have password validation', () => {
      expect(wrapper.vm.v$.form.password).toBeDefined();
    });

    it('should have password minLength validation', () => {
      expect(wrapper.vm.v$.form.password.minLength).toBeDefined();
    });

    it('should have password maxLength validation', () => {
      expect(wrapper.vm.v$.form.password.maxLength).toBeDefined();
    });

    it('should have passwordConfirmation validation', () => {
      expect(wrapper.vm.v$.form.passwordConfirmation).toBeDefined();
    });

    it('should have sameAsPassword validator for passwordConfirmation', () => {
      expect(
        wrapper.vm.v$.form.passwordConfirmation.sameAsPassword,
      ).toBeDefined();
    });

    it('should have privilege validation', () => {
      expect(wrapper.vm.v$.form.privilege).toBeDefined();
      expect(wrapper.vm.v$.form.privilege.required).toBeDefined();
    });
  });

  describe('VuelidateMixin integration', () => {
    it('should have getValidationState method from mixin', () => {
      expect(typeof wrapper.vm.getValidationState).toBe('function');
    });

    it('getValidationState should return null when not dirty', () => {
      const result = wrapper.vm.getValidationState(wrapper.vm.v$.form.username);
      expect(result).toBe(null);
    });

    it('getValidationState should return boolean when dirty', async () => {
      wrapper.vm.v$.form.username.$touch();
      await wrapper.vm.$nextTick();

      const result = wrapper.vm.getValidationState(wrapper.vm.v$.form.username);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Validation dirty state tracking', () => {
    it('should start with clean validation state', () => {
      expect(wrapper.vm.v$.form.username.$dirty).toBe(false);
      expect(wrapper.vm.v$.form.password.$dirty).toBe(false);
    });

    it('should become dirty after $touch is called', async () => {
      wrapper.vm.v$.form.username.$touch();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.v$.form.username.$dirty).toBe(true);
    });

    it('should reset dirty state when $reset is called', async () => {
      wrapper.vm.v$.form.username.$touch();
      wrapper.vm.v$.form.password.$touch();
      await wrapper.vm.$nextTick();

      wrapper.vm.v$.$reset();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.v$.form.username.$dirty).toBe(false);
      expect(wrapper.vm.v$.form.password.$dirty).toBe(false);
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
      wrapper.vm.form.username = 'testuser';
      wrapper.vm.v$.form.username.$touch();
      await wrapper.vm.$nextTick();

      wrapper.vm.resetForm();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.v$.form.username.$dirty).toBe(false);
      expect(wrapper.vm.form.username).toBe('');
    });
  });

  describe('Validators use @vuelidate/validators', () => {
    it('required validator should have $params', () => {
      expect(wrapper.vm.v$.form.username.required.$params).toBeDefined();
    });

    it('maxLength validator should have $params with max value', () => {
      expect(wrapper.vm.v$.form.username.maxLength.$params).toBeDefined();
      expect(wrapper.vm.v$.form.username.maxLength.$params.max).toBe(16);
    });

    it('minLength validator should have $params with min value', () => {
      expect(wrapper.vm.v$.form.password.minLength.$params).toBeDefined();
      expect(wrapper.vm.v$.form.password.minLength.$params.min).toBe(8);
    });
  });
});
