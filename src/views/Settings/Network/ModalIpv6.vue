<template>
  <b-modal
    id="modal-add-ipv6"
    ref="modal"
    :title="$t('pageNetwork.table.addIpv6Address')"
    @hidden="resetForm"
  >
    <b-form id="form-ipv6" @submit.prevent="handleSubmit">
      <b-row>
        <b-col sm="6">
          <b-form-group
            :label="$t('pageNetwork.modal.ipAddress')"
            label-for="ipAddress"
          >
            <b-form-input
              id="ipAddress"
              v-model="form.ipAddress"
              type="text"
              :state="getValidationState(v$.form.ipAddress)"
              @input="v$.form.ipAddress.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="v$.form.ipAddress.required.$invalid">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-if="v$.form.ipAddress.validateIpv6.$invalid">
                {{ $t('global.form.invalidFormat') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
        <b-col sm="6">
          <b-form-group
            :label="$t('pageNetwork.modal.prefixLength')"
            label-for="prefixLength"
          >
            <b-form-input
              id="prefixLength"
              v-model="form.prefixLength"
              type="text"
              :state="getValidationState(v$.form.prefixLength)"
              @input="v$.form.prefixLength.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="v$.form.prefixLength.required.$invalid">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template
                v-if="v$.form.prefixLength.validatePrefixLength.$invalid"
              >
                {{ $t('global.form.invalidFormat') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
    <template #footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button form="form-ipv6" type="submit" variant="primary" @click="onOk">
        {{ $t('global.action.add') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { required, helpers } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';

const validateIpv6 = helpers.regex(
  /^((?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,7}:|(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}|(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}|(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}|(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}|[a-fA-F0-9]{1,4}:(?::[a-fA-F0-9]{1,4}){1,6}|:(?::[a-fA-F0-9]{1,4}){1,7}|::|(?:[a-fA-F0-9]{1,4}:){6}(?:[0-9]{1,3}\.){3}[0-9]{1,3}|::(?:[a-fA-F0-9]{1,4}:){0,5}(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,5}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,4}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,3}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){1,2}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|[a-fA-F0-9]{1,4}:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|::(?:[0-9]{1,3}\.){3}[0-9]{1,3})$/,
);

const validatePrefixLength = helpers.regex(
  /^(12[0-8]|1[0-9]|[1-9][0-9]|[0-9])$/,
);

export default {
  mixins: [VuelidateMixin],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['ok', 'hidden', 'update:modelValue'],
  setup() {
    return {
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      form: {
        ipAddress: '',
        prefixLength: '',
      },
    };
  },
  validations() {
    return {
      form: {
        ipAddress: {
          required,
          validateIpv6,
        },
        prefixLength: {
          required,
          validatePrefixLength,
        },
      },
    };
  },
  watch: {
    modelValue: {
      handler(newValue) {
        if (newValue) {
          this.$nextTick(() => {
            this.$refs.modal?.show();
          });
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleSubmit() {
      this.v$.$touch();
      if (this.v$.$invalid) return;
      this.$emit('ok', {
        Address: this.form.ipAddress,
        PrefixLength: parseInt(this.form.prefixLength),
      });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.ipAddress = null;
      this.form.prefixLength = null;
      this.v$.$reset();
      this.$emit('update:modelValue', false);
      this.$emit('hidden');
    },
    onOk(bvModalEvt) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
