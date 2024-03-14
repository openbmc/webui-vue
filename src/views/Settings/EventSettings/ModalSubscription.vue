<template>
  <b-modal id="modal-subscription" @hidden="resetForm">
    <template #modal-title>
      {{ $t('pageEventSettings.addSubscription') }}
    </template>

    <b-form
      id="form-subscription"
      ref="formSubscription"
      novalidate
      @submit.prevent="submitForm"
    >
      <b-form-group>
        <page-section>
          <b-row>
            <b-col lg="6">
              <b-form-group
                :label="$t('pageEventSettings.form.protocol')"
                label-for="subscription-protocol"
              >
                <b-form-select
                  id="subscription-protocol"
                  v-model="form.protocol"
                  data-test-id="eventsettings-subscription-protocol"
                  :options="protocols"
                  @change="selectProtocol"
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col lg="6">
              <b-form-group
                label-for="subscription-ip"
                :label="$t('pageEventSettings.form.ip')"
              >
                <b-form-input
                  id="subscription-ip"
                  v-model="form.ip"
                  :state="getValidationState($v.form.ip)"
                  data-test-id="eventsettings-subscription-ip"
                  @input="$v.form.ip.$touch"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.ip.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                  <template v-else-if="!$v.form.ip.pattern">
                    {{ $t('global.form.invalidFormat') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
              <b-form-group
                label-for="subscription-port"
                :label="$t('pageEventSettings.form.port')"
              >
                <b-form-input
                  id="subscription-port"
                  v-model="form.port"
                  :state="getValidationState($v.form.port)"
                  data-test-id="eventsettings-subscription-port"
                  @input="$v.form.port.$touch"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.port.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                  <template v-else-if="!$v.form.port.pattern">
                    {{ $t('pageEventSettings.form.invalidPort') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
        </page-section>
      </b-form-group>
    </b-form>

    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="subscription-button-cancel"
        @click="cancel"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        form="form-subscription"
        data-test-id="subscription-button-save"
        type="submit"
        variant="primary"
      >
        {{ $t('global.action.add') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { required, helpers } from 'vuelidate/lib/validators';

const validateIp = helpers.regex(
  'validateIp',
  /^(?=.*[^.]$)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.?){4}$/,
);
const validatePort = helpers.regex('validatePort', /^[0-9]{3,4}$/);

export default {
  components: {
    PageSection,
  },
  mixins: [LoadingBarMixin, VuelidateMixin, BVToastMixin],
  data() {
    return {
      form: {
        protocol: 'SNMPv2c',
        ip: '',
        port: '',
      },
      protocols: [{ value: 'SNMPv2c', text: 'SNMP' }],
      protocolFormats: {
        SNMPv2c: 'snmp',
      },
    };
  },
  validations() {
    return {
      form: {
        ip: {
          required,
          pattern: validateIp,
        },
        port: {
          required,
          pattern: validatePort,
        },
      },
    };
  },
  methods: {
    resetForm() {
      this.$v.$reset();
    },
    selectProtocol() {
      this.form.ip = '';
      this.form.port = '';
      this.$v.$reset();
    },
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.startLoader();

      let subscriptionForm = {
        protocol: this.form.protocol,
      };

      subscriptionForm.destination =
        this.protocolFormats[this.form.protocol] +
        '://' +
        this.form.ip +
        ':' +
        this.form.port;

      this.$store
        .dispatch('eventSettings/createSubscription', subscriptionForm)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.$reset();
          this.endLoader();
        });
      this.$bvModal.hide('modal-subscription');
    },
  },
};
</script>
