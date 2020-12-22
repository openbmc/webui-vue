<template>
  <b-modal
    id="configure-connection"
    ref="modal"
    @ok="onOk"
    @hidden="resetForm"
    @show="initModal"
  >
    <template #modal-title>
      {{ $t('pageVirtualMedia.modal.title') }}
    </template>
    <b-form>
      <b-form-group
        :label="$t('pageVirtualMedia.modal.serverUri')"
        label-for="serverUri"
      >
        <b-form-input
          id="serverUri"
          v-model="form.serverUri"
          type="text"
          :state="getValidationState($v.form.serverUri)"
          data-test-id="configureConnection-input-serverUri"
          @input="$v.form.serverUri.$touch()"
        />
        <b-form-invalid-feedback role="alert">
          <template v-if="!$v.form.serverUri.required">
            {{ $t('global.form.fieldRequired') }}
          </template>
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group
        :label="$t('pageVirtualMedia.modal.username')"
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
        :label="$t('pageVirtualMedia.modal.password')"
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
      {{ $t('global.action.save') }}
    </template>
    <template #modal-cancel>
      {{ $t('global.action.cancel') }}
    </template>
  </b-modal>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  mixins: [VuelidateMixin],
  props: {
    connection: {
      type: Object,
      default: null,
      validator: (prop) => {
        console.log(prop);
        return true;
      },
    },
  },
  data() {
    return {
      form: {
        serverUri: null,
        username: null,
        password: null,
        isRW: false,
      },
    };
  },
  watch: {
    connection: function (value) {
      if (value === null) return;
      Object.assign(this.form, value);
    },
  },
  validations() {
    return {
      form: {
        serverUri: {
          required,
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      let connectionData = {};
      Object.assign(connectionData, this.form);
      this.$emit('ok', connectionData);
      this.closeModal();
    },
    initModal() {
      if (this.connection) {
        Object.assign(this.form, this.connection);
      }
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.serverUri = null;
      this.form.username = null;
      this.form.password = null;
      this.form.isRW = false;
      this.$v.$reset();
    },
    onOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
