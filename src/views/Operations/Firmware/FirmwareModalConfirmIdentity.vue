<template>
  <b-modal
    id="modal-confirm-identity"
    :title="$t('pageFirmware.sectionTitleConfirmIdentify')"
    @hidden="resetForm"
  >
    <p>{{ $t('pageFirmware.modal.confirmIdentityInfo') }}</p>
    <p />
    <b-form-group :label="$t('pageFirmware.modal.remoteServerIp')">
      <b-form-input
        id="remote-server-ip"
        v-model="remoteServerIp"
        type="text"
        :state="getValidationState($v.remoteServerIp)"
        @input="$v.remoteServerIp.$touch()"
      />
      <b-form-invalid-feedback role="alert">
        {{ $t('global.form.fieldRequired') }}
      </b-form-invalid-feedback>
    </b-form-group>
    <b-form-group :label="$t('pageFirmware.modal.remoteServerKey')">
      <b-form-textarea
        id="remote-server-key"
        v-model="remoteServerKey"
        rows="3"
        max-rows="6"
        placeholder="<type> <public_key>"
        :state="getValidationState($v.remoteServerKey)"
        @input="$v.remoteServerKey.$touch()"
      />
      <b-form-invalid-feedback role="alert">
        {{ $t('global.form.fieldRequired') }}
      </b-form-invalid-feedback>
    </b-form-group>
    <p />
    <template v-if="bmcKey != null">
      <p>{{ $t('pageFirmware.modal.bmcKeyInfo') }}</p>
      <b-form-textarea
        id="bmc-key"
        v-model="bmcKey"
        disabled="true"
        rows="3"
        max-rows="6"
      ></b-form-textarea>
    </template>
    <template v-if="errMessage != null">
      <status-icon status="danger" />
      <p>{{ errMessage }}</p>
    </template>
    <template #modal-footer>
      <b-button type="submit" variant="primary" @click="exchangeKey">
        {{ $t('pageFirmware.modal.exchangeKey') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { BFormTextarea } from 'bootstrap-vue';
import { required } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import StatusIcon from '@/components/Global/StatusIcon';

export default {
  components: {
    BFormTextarea,
    StatusIcon,
  },
  mixins: [VuelidateMixin],
  props: {
    defaultRemoteServerIp: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      remoteServerIp: null,
      remoteServerKey: null,
      bmcKey: null,
      errMessage: null,
    };
  },
  watch: {
    defaultRemoteServerIp() {
      this.remoteServerIp = this.defaultRemoteServerIp;
    },
  },
  validations() {
    return {
      remoteServerIp: {
        required,
      },
      remoteServerKey: {
        required,
      },
    };
  },
  methods: {
    exchangeKey(bvModalEvt) {
      // prevent modal close
      bvModalEvt.preventDefault();

      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.bmcKey = null;
      this.errMessage = null;

      this.$store
        .dispatch('firmware/exchangePublicKey', {
          remoteServerIp: this.remoteServerIp,
          remoteServerKey: this.remoteServerKey,
        })
        .then((key) => {
          this.bmcKey = key;
        })
        .catch((err) => {
          this.errMessage = err;
        });
    },
    resetForm() {
      this.remoteServerIp = this.defaultRemoteServerIp;
      this.remoteServerKey = null;
      this.bmcKey = null;
      this.errMessage = null;
      this.$v.$reset();
    },
  },
};
</script>
