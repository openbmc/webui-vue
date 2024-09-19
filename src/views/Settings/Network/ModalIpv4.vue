<template>
  <b-modal
    id="modal-add-ipv4"
    ref="modal"
    :title="$t('pageNetwork.table.addIpv4Address')"
    @hidden="resetForm"
  >
    <b-form id="form-ipv4" @submit.prevent="handleSubmit">
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
              <template v-if="v$.form.ipAddress.ipAddress.$invalid">
                {{ $t('global.form.invalidFormat') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
        <b-col sm="6">
          <b-form-group
            :label="$t('pageNetwork.modal.gateway')"
            label-for="gateway"
          >
            <b-form-input
              id="gateway"
              v-model="form.gateway"
              type="text"
              :state="getValidationState(v$.form.gateway)"
              @input="v$.form.gateway.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="v$.form.gateway.required.$invalid">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-if="v$.form.gateway.ipAddress.$invalid">
                {{ $t('global.form.invalidFormat') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="6">
          <b-form-group
            :label="$t('pageNetwork.modal.subnetMask')"
            label-for="subnetMask"
          >
            <b-form-input
              id="subnetMask"
              v-model="form.subnetMask"
              type="text"
              :state="getValidationState(v$.form.subnetMask)"
              @input="v$.form.subnetMask.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="v$.form.subnetMask.required.$invalid">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-if="v$.form.subnetMask.ipAddress.$invalid">
                {{ $t('global.form.invalidFormat') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button form="form-ipv4" type="submit" variant="primary" @click="onOk">
        {{ $t('global.action.add') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { useVuelidate } from '@vuelidate/core';

import { ipAddress, required } from '@vuelidate/validators';
import { useI18n } from 'vue-i18n';

export default {
  mixins: [VuelidateMixin],
  props: {
    defaultGateway: {
      type: String,
      default: '',
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
        ipAddress: '',
        gateway: '',
        subnetMask: '',
      },
    };
  },
  watch: {
    defaultGateway() {
      this.form.gateway = this.defaultGateway;
    },
  },
  validations() {
    return {
      form: {
        ipAddress: {
          required,
          ipAddress,
        },
        gateway: {
          required,
          ipAddress,
        },
        subnetMask: {
          required,
          ipAddress,
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      this.v$.$touch();
      if (this.v$.$invalid) return;
      this.$emit('ok', {
        Address: this.form.ipAddress,
        Gateway: this.form.gateway,
        SubnetMask: this.form.subnetMask,
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
      this.form.gateway = this.defaultGateway;
      this.form.subnetMask = null;
      this.v$.$reset();
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
