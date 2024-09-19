<template>
  <b-modal
    id="modal-dns"
    ref="modal"
    :title="$t('pageNetwork.table.addDnsAddress')"
    @hidden="resetForm"
  >
    <b-form id="form-dns" @submit.prevent="handleSubmit">
      <b-row>
        <b-col sm="6">
          <b-form-group
            :label="$t('pageNetwork.modal.staticDns')"
            label-for="staticDns"
          >
            <b-form-input
              id="staticDns"
              v-model="form.staticDns"
              type="text"
              :state="getValidationState(v$.form.staticDns)"
              @input="v$.form.staticDns.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="v$.form.staticDns.required.$invalid">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-if="v$.form.staticDns.ipAddress.$invalid">
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
      <b-button form="form-dns" type="submit" variant="primary" @click="onOk">
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
  setup() {
    return {
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      $t: useI18n().t,
      form: {
        staticDns: null,
      },
    };
  },
  validations() {
    return {
      form: {
        staticDns: {
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
      this.$emit('ok', [this.form.staticDns]);
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.staticDns = null;
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
