<template>
  <b-modal
    id="configure-connection"
    ref="modal"
    @ok="onOk"
    @hidden="resetForm"
    @show="initModal"
  >
    <template #modal-title>
      {{ t('pageVirtualMedia.modal.title') }}
    </template>
    <b-form>
      <b-form-group
        :label="t('pageVirtualMedia.modal.serverUri')"
        label-for="serverUri"
      >
        <b-form-input
          id="serverUri"
          v-model="form.serverUri"
          type="text"
          :state="getValidationState(v$.form.serverUri)"
          data-test-id="configureConnection-input-serverUri"
          @input="v$.form.serverUri.$touch()"
        />
        <b-form-invalid-feedback role="alert">
          <template v-if="!v$.form.serverUri.required">
            {{ t('global.form.fieldRequired') }}
          </template>
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group
        :label="t('pageVirtualMedia.modal.username')"
        label-for="username"
      >
        <b-form-input
          id="username"
          v-model="form.username"
          type="text"
          data-test-id="configureConnection-input-username"
        />
      </b-form-group>
      <b-form-group
        :label="t('pageVirtualMedia.modal.password')"
        label-for="password"
      >
        <b-form-input
          id="password"
          v-model="form.password"
          type="password"
          data-test-id="configureConnection-input-password"
        />
      </b-form-group>
      <b-form-group>
        <b-form-checkbox
          v-model="form.isRW"
          data-test-id="configureConnection-input-isRW"
          name="check-button"
        >
          RW
        </b-form-checkbox>
      </b-form-group>
    </b-form>
    <template #modal-ok>
      {{ t('global.action.save') }}
    </template>
    <template #modal-cancel>
      {{ t('global.action.cancel') }}
    </template>
  </b-modal>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
// import { VuelidateMixin } from '@/components/Mixins/VuelidateMixin.js';
import  useVuelidateComposable  from '@/components/Composables/useVuelidateComposable';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { ref } from 'vue';
import { watch } from 'vue';
const { getValidationState } = useVuelidateComposable();
const props = defineProps(['connection']);
const form = reactive({ serverUri: null, username: null, password: null,isRW: null  });
const valid = { serverUri: { required } };
const v$ = useVuelidate(valid, form);
const { t } = useI18n();
  watch('connection',(value)=>{
    if (value === null) return;
      Object.assign(this.form, value);
  })

   const handleSubmit = () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;
      let connectionData = {};
      Object.assign(connectionData, this.form);
      this.$emit('ok', connectionData);
      closeModal();
    }
    const initModal = () => {
      if (connection) {
        Object.assign(form, connection);
      }
    }
    const modal = ref(null)
    const closeModal = ()=> {
      nextTick(() => {
        modal.hide();
        });
    }
    const resetForm = ()=> {
      form.serverUri = null;
      form.username = null;
      form.password = null;
      form.isRW = false;
      v$.$reset();
    }
    const onOk = (bvModalEvt) => {
      bvModalEvt.preventDefault();
     handleSubmit();
    }
</script>
