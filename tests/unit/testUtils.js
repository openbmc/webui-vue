import { vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { createStore } from 'vuex';

// Create a minimal i18n instance for testing
export function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'en-US',
    fallbackLocale: 'en-US',
    silentFallbackWarn: true,
    messages: {
      'en-US': {
        global: {
          table: { fromDate: 'From date', toDate: 'To date' },
          form: {
            fieldRequired: 'Field required',
            invalidFormat: 'Invalid format',
            dateMustBeBefore: 'Date must be before {date}',
            dateMustBeAfter: 'Date must be after {date}',
            lengthMustBeBetween: 'Length must be between {min} and {max}',
            selectAnOption: 'Select an option',
          },
          action: {
            cancel: 'Cancel',
            save: 'Save',
            add: 'Add',
          },
          status: {
            enabled: 'Enabled',
            disabled: 'Disabled',
          },
        },
        pageUserManagement: {
          addUser: 'Add user',
          editUser: 'Edit user',
          modal: {
            accountLocked: 'Account locked',
            clickSaveToUnlockAccount: 'Click save to unlock account',
            unlock: 'Unlock',
            accountStatus: 'Account status',
            username: 'Username',
            cannotStartWithANumber: 'Cannot start with a number',
            noSpecialCharactersExceptUnderscore:
              'No special characters except underscore',
            privilege: 'Privilege',
            userPassword: 'User password',
            passwordMustBeBetween: 'Password must be between {min} and {max}',
            confirmUserPassword: 'Confirm user password',
            passwordsDoNotMatch: 'Passwords do not match',
          },
        },
        pageNetwork: {
          hostname: 'Hostname',
          macAddress: 'MAC address',
          modal: {
            editHostnameTitle: 'Edit hostname',
            editMacAddressTitle: 'Edit MAC address',
          },
        },
        pageFactoryReset: {
          modal: {
            resetBiosSubmitText: 'Reset BIOS',
          },
        },
      },
    },
  });
}

// Common Bootstrap Vue Next component stubs
export const bootstrapStubs = {
  'b-row': { template: '<div><slot /></div>' },
  'b-col': { template: '<div><slot /></div>' },
  'b-container': { template: '<div><slot /></div>' },
  'b-form': {
    template: '<form @submit.prevent="$emit(\'submit\')"><slot /></form>',
    emits: ['submit'],
  },
  'b-form-group': { template: '<div><slot /></div>' },
  'b-input-group': { template: '<div><slot /></div>' },
  'b-form-input': {
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\')" @change="$emit(\'change\', $event.target.value)" />',
    props: ['modelValue', 'state', 'type', 'id'],
    emits: ['update:modelValue', 'blur', 'change', 'input'],
  },
  'b-form-select': {
    template:
      '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value); $emit(\'change\', $event.target.value)"><slot /><slot name="first" /></select>',
    props: ['modelValue', 'options', 'state'],
    emits: ['update:modelValue', 'change'],
  },
  'b-form-select-option': { template: '<option><slot /></option>' },
  'b-form-radio': {
    template:
      '<label class="form-check"><input type="radio" :value="value" :checked="modelValue === value" @change="$emit(\'update:modelValue\', value); $emit(\'change\', value)" /><slot /></label>',
    props: ['modelValue', 'value', 'name'],
    emits: ['update:modelValue', 'change'],
  },
  'b-form-checkbox': {
    template:
      '<label class="form-check"><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot /></label>',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
  'b-form-text': { template: '<div><slot /></div>' },
  'b-form-invalid-feedback': { template: '<div><slot /></div>' },
  'b-button': {
    template: '<button @click="$emit(\'click\', $event)"><slot /></button>',
    emits: ['click'],
  },
  'b-modal': {
    template:
      '<div v-if="modelValue"><slot></slot><slot name="footer" :cancel="() => $emit(\'update:modelValue\', false)"></slot></div>',
    props: ['modelValue', 'title', 'id'],
    emits: ['update:modelValue', 'hidden'],
    methods: {
      hide() {
        this.$emit('update:modelValue', false);
        this.$emit('hidden');
      },
      show() {
        this.$emit('update:modelValue', true);
      },
    },
  },
};

// Create common modal stub with refs
export function createModalStub() {
  return {
    template:
      '<div><slot></slot><slot name="footer" :cancel="() => {}"></slot></div>',
    methods: {
      hide: vi.fn(),
      show: vi.fn(),
    },
  };
}

// Create a basic Vuex store for testing
export function createTestStore(modules = {}) {
  return createStore({
    modules: {
      global: {
        namespaced: true,
        getters: {
          username: () => 'admin',
          languagePreference: () => 'en-US',
          serverStatus: () => 'on',
          timezone: () => 'UTC',
        },
        ...modules.global,
      },
      ...modules,
    },
  });
}
