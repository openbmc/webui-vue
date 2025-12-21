import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { createI18n } from 'vue-i18n';
import TableDateFilter from '@/components/Global/TableDateFilter';

describe('TableDateFilter.vue', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages: {
      'en-US': {
        global: {
          table: { fromDate: 'From date', toDate: 'To date' },
          form: {
            invalidFormat: 'Invalid format',
            dateMustBeBefore: 'Date must be before {date}',
            dateMustBeAfter: 'Date must be after {date}',
          },
        },
      },
    },
  });

  const store = createStore({
    modules: {
      global: {
        namespaced: true,
        getters: {
          languagePreference: () => 'en-US',
        },
      },
    },
  });

  const wrapper = mount(TableDateFilter, {
    global: {
      plugins: [store, i18n],
      mocks: {
        $t: (key) => key,
      },
      stubs: {
        'b-row': { template: '<div><slot /></div>' },
        'b-col': { template: '<div><slot /></div>' },
        'b-form-group': { template: '<div><slot /></div>' },
        'b-input-group': { template: '<div><slot /></div>' },
        'b-form-input': {
          template:
            '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\')" />',
          props: ['modelValue', 'state'],
          emits: ['update:modelValue', 'blur'],
        },
        'b-form-invalid-feedback': { template: '<div><slot /></div>' },
      },
    },
  });

  // Reset validation state between tests
  beforeEach(async () => {
    wrapper.vm.fromDate = '';
    wrapper.vm.toDate = '';
    wrapper.vm.v$.$reset();
    await wrapper.vm.$nextTick();
  });

  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should render from and to date inputs', () => {
    expect(wrapper.find('#input-from-date').exists()).toBe(true);
    expect(wrapper.find('#input-to-date').exists()).toBe(true);
  });

  describe('Date validation', () => {
    it('should accept valid ISO date format (YYYY-MM-DD)', async () => {
      await wrapper.find('#input-from-date').setValue('2025-01-15');
      wrapper.vm.v$.fromDate.$touch();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.v$.fromDate.pattern.$invalid).toBe(false);
    });

    it('should have no validation error when dates are empty', async () => {
      wrapper.vm.v$.fromDate.$touch();
      wrapper.vm.v$.toDate.$touch();
      await wrapper.vm.$nextTick();

      // Empty dates should pass pattern validation (pattern only validates non-empty)
      expect(wrapper.vm.v$.fromDate.$error).toBe(false);
      expect(wrapper.vm.v$.toDate.$error).toBe(false);
    });

    it('should validate fromDate is not after toDate', async () => {
      wrapper.vm.fromDate = '2025-01-20';
      wrapper.vm.toDate = '2025-01-15';
      wrapper.vm.v$.fromDate.$touch();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.v$.fromDate.maxDate.$invalid).toBe(true);
    });

    it('should pass validation when fromDate is before toDate', async () => {
      wrapper.vm.fromDate = '2025-01-10';
      wrapper.vm.toDate = '2025-01-20';
      wrapper.vm.v$.fromDate.$touch();
      wrapper.vm.v$.toDate.$touch();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.v$.fromDate.maxDate.$invalid).toBe(false);
      expect(wrapper.vm.v$.toDate.minDate.$invalid).toBe(false);
    });

    it('should validate toDate is not before fromDate', async () => {
      wrapper.vm.fromDate = '2025-01-20';
      wrapper.vm.toDate = '2025-01-10';
      wrapper.vm.v$.toDate.$touch();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.v$.toDate.minDate.$invalid).toBe(true);
    });

    it('should emit change event with valid date range', async () => {
      wrapper.vm.fromDate = '2025-01-01';
      wrapper.vm.toDate = '2025-01-31';
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted('change');
      expect(emitted).toBeTruthy();
      expect(emitted[emitted.length - 1][0]).toHaveProperty('fromDate');
      expect(emitted[emitted.length - 1][0]).toHaveProperty('toDate');
    });
  });
});
