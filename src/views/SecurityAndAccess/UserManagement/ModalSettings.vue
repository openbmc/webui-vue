<template>
  <b-modal
    id="modal-settings"
    ref="modal"
    :title="$t('pageUserManagement.accountPolicySettings')"
    @hidden="resetForm"
  >
    <b-form id="form-settings" novalidate @submit.prevent="handleSubmit">
      <b-container>
        <b-row>
          <b-col>
            <b-form-group
              :label="$t('pageUserManagement.modal.maxFailedLoginAttempts')"
              label-for="lockout-threshold"
            >
              <b-form-text id="lockout-threshold-help-block">
                {{
                  $t('global.form.valueMustBeBetween', {
                    min: 0,
                    max: 65535,
                  })
                }}
              </b-form-text>
              <b-form-input
                id="lockout-threshold"
                v-model.number="form.lockoutThreshold"
                type="number"
                aria-describedby="lockout-threshold-help-block"
                data-test-id="userManagement-input-lockoutThreshold"
                :state="getValidationState(v$.form.lockoutThreshold)"
                @input="v$.form.lockoutThreshold.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                <template v-if="v$.form.lockoutThreshold.required.$invalid">
                  {{ $t('global.form.fieldRequired') }}
                </template>
                <template
                  v-else-if="
                    !v$.form.lockoutThreshold.minLength ||
                    !v$.form.lockoutThreshold.maxLength
                  "
                >
                  {{
                    $t('global.form.valueMustBeBetween', {
                      min: 0,
                      max: 65535,
                    })
                  }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group
              :label="$t('pageUserManagement.modal.userUnlockMethod')"
            >
              <b-form-radio
                v-model="form.unlockMethod"
                name="unlock-method"
                class="mb-2"
                :value="0"
                data-test-id="userManagement-radio-manualUnlock"
                @input="v$.form.unlockMethod.$touch()"
              >
                {{ $t('pageUserManagement.modal.manual') }}
              </b-form-radio>
              <b-form-radio
                v-model="form.unlockMethod"
                name="unlock-method"
                :value="1"
                data-test-id="userManagement-radio-automaticUnlock"
                @input="v$.form.unlockMethod.$touch()"
              >
                {{ $t('pageUserManagement.modal.automaticAfterTimeout') }}
              </b-form-radio>
              <div class="mt-3 ml-4">
                <b-form-text id="lockout-duration-help-block">
                  {{ $t('pageUserManagement.modal.timeoutDurationSeconds') }}
                </b-form-text>
                <b-form-input
                  v-model.number="form.lockoutDuration"
                  aria-describedby="lockout-duration-help-block"
                  type="number"
                  data-test-id="userManagement-input-lockoutDuration"
                  :state="getValidationState(v$.form.lockoutDuration)"
                  :readonly="v$.form.unlockMethod.$model === 0"
                  @input="v$.form.lockoutDuration.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="v$.form.lockoutDuration.required.$invalid">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                  <template v-else-if="!v$.form.lockoutDuration.minvalue">
                    {{ $t('global.form.mustBeAtLeast', { value: 1 }) }}
                  </template>
                </b-form-invalid-feedback>
              </div>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="userManagement-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        form="form-settings"
        type="submit"
        variant="primary"
        data-test-id="userManagement-button-submit"
        @click="onOk"
      >
        {{ $t('global.action.save') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import {
  required,
  requiredIf,
  minValue,
  maxValue,
} from '@vuelidate/validators';

export default {
  mixins: [VuelidateMixin],
  props: {
    settings: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      $t: useI18n().t,
      form: {
        lockoutThreshold: 0,
        unlockMethod: 0,
        lockoutDuration: null,
      },
    };
  },
  watch: {
    settings: function ({ lockoutThreshold, lockoutDuration }) {
      this.form.lockoutThreshold = lockoutThreshold;
      this.form.unlockMethod = lockoutDuration ? 1 : 0;
      this.form.lockoutDuration = lockoutDuration ? lockoutDuration : null;
    },
  },
  validations: {
    form: {
      lockoutThreshold: {
        minValue: minValue(0),
        maxValue: maxValue(65535),
        required,
      },
      unlockMethod: { required },
      lockoutDuration: {
        minValue: function (value) {
          return this.form.unlockMethod === 0 || value > 0;
        },
        required: requiredIf(function () {
          return this.form.unlockMethod === 1;
        }),
      },
    },
  },
  methods: {
    handleSubmit() {
      this.v$.$touch();
      if (this.v$.$invalid) return;

      let lockoutThreshold;
      let lockoutDuration;
      if (this.v$.form.lockoutThreshold.$dirty) {
        lockoutThreshold = this.form.lockoutThreshold;
      }
      if (this.v$.form.unlockMethod.$dirty) {
        lockoutDuration = this.form.unlockMethod
          ? parseInt(this.form.lockoutDuration)
          : 0;
      }

      this.$emit('ok', { lockoutThreshold, lockoutDuration });
      this.closeModal();
    },
    onOk(bvModalEvt) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      // Reset form models
      this.form.lockoutThreshold = this.settings.lockoutThreshold;
      this.form.unlockMethod = this.settings.lockoutDuration ? 1 : 0;
      this.form.lockoutDuration = this.settings.lockoutDuration
        ? this.settings.lockoutDuration
        : null;
      this.v$.$reset(); // clear validations
    },
  },
};
</script>
