<template>
  <b-modal id="modal-subscription" ref="modal" @hidden="resetFormSubscription">
    <template #modal-title>
      {{ $t('pageEventSettings.addSubscription') }}
    </template>

    <b-form
      id="form-subscription"
      ref="formSubscription"
      novalidate
      @submit.prevent="submitFormSubscription"
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
                  :options="selectProtocols"
                  @change="selectProtocol"
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row
            v-if="form.protocol === 'Syslog' || form.protocol === 'SNMPv2c'"
          >
            <b-col lg="6">
              <b-form-group v-if="form.protocol === 'Syslog'">
                <b-form-radio-group v-model="form.syslog">
                  <b-form-radio
                    id="subscription-tcp"
                    data-test-id="eventsettings-subscription-tcp"
                    value="SyslogTCP"
                  >
                    TCP
                  </b-form-radio>
                  <b-form-radio
                    id="subscription-udp"
                    data-test-id="eventsettings-subscription-udp"
                    value="SyslogUDP"
                  >
                    UDP
                  </b-form-radio>
                </b-form-radio-group>
              </b-form-group>
              <b-form-group
                label-for="subscription-ip"
                :label="$t('pageEventSettings.form.ip')"
              >
                <b-form-input
                  id="subscription-ip"
                  v-model="form.ip"
                  data-test-id="eventsettings-subscription-ip"
                  type="text"
                />
              </b-form-group>
              <b-form-group
                label-for="subscription-port"
                :label="$t('pageEventSettings.form.port')"
              >
                <b-form-input
                  id="subscription-port"
                  v-model="form.port"
                  data-test-id="eventsettings-subscription-port"
                  type="text"
                />
              </b-form-group>
              <b-form-text
                v-if="form.protocol === 'Syslog'"
                id="syslog-help-block"
              >
                {{ $t('pageEventSettings.syslogHelp') }}
              </b-form-text>
            </b-col>
          </b-row>
          <b-row v-if="form.protocol === 'SMTP'">
            <b-col lg="6">
              <b-form-group
                :label="$t('pageEventSettings.form.email')"
                label-for="subscription-email"
              >
                <b-form-input
                  id="subscription-email"
                  v-model="form.email"
                  data-test-id="eventsettings-subscription-email"
                  type="text"
                />
              </b-form-group>
              <b-form-group
                :label="$t('pageEventSettings.form.lowestSeverity')"
                label-for="subscription-lowest-severity"
              >
                <b-form-select
                  id="subscription-lowest-severity"
                  v-model="form.lowestSeverity"
                  data-test-id="eventsettings-subscription-lowest-severity"
                  :options="lowestSeverities"
                />
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
import { required, helpers } from 'vuelidate/lib/validators';

const validateIp = helpers.regex(
  'validateIp',
  /^(?=.*[^.]$)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.?){4}$/,
);

const validatePort = helpers.regex('validatePort', /^[0-9]{3,4}$/);
const validateEmail = helpers.regex('validateEmail', /[A-z].*@[A-z].*/);

export default {
  components: {
    PageSection,
  },
  mixins: [LoadingBarMixin, BVToastMixin],
  data() {
    return {
      form: {
        protocol: '',
        syslog: 'SyslogTCP',
        ip: '',
        port: '',
        email: '',
        lowestSeverity: 'Emergency',
      },
      selectProtocols: [
        { value: 'Syslog', text: 'Remote Syslog' },
        { value: 'SNMPv2c', text: 'SNMP' },
        { value: 'SMTP', text: 'SMTP' },
      ],
      protocolFormats: {
        SyslogTCP: 'tcp',
        SyslogUDP: 'udp',
        SNMPv2c: 'snmp',
        SMTP: 'smtp',
      },
      lowestSeverities: [
        {
          value: 'Emergency',
          text: 'Emergency',
        },
        {
          value: 'Alert',
          text: 'Alert',
        },
        {
          value: 'Critical',
          text: 'Critical',
        },
        {
          value: 'Error',
          text: 'Error',
        },
        {
          value: 'Warning',
          text: 'Warning',
        },
        {
          value: 'Notice',
          text: 'Notice',
        },
        {
          value: 'Informational',
          text: 'Informational',
        },
        {
          value: 'Debug',
          text: 'Debug',
        },
      ],
      syslogInitial: {},
    };
  },
  validations() {
    return {
      form: {
        protocol: {
          required,
        },
        ip: {
          pattern: validateIp,
        },
        port: {
          pattern: validatePort,
        },
        email: {
          pattern: validateEmail,
        },
      },
    };
  },
  mounted() {
    this.$root.$on('resetFormSubscription', () => {
      this.resetFormSubscription();
    });
  },
  methods: {
    resetFormSubscription() {
      this.form.protocol = '';
      this.form.syslog = '';
      this.form.ip = '';
      this.form.port = '';
      this.form.email = '';
      this.form.lowestSeverity = 'Emergency';
      this.$v.$reset();
      this.$emit('hidden');
    },
    setSyslogTCPInitial() {
      this.syslogInitial.ip =
        this.$store.getters['eventSettings/getSyslogTCPIp'];
      this.syslogInitial.port =
        this.$store.getters['eventSettings/getSyslogTCPPort'];
      this.form.ip = this.syslogInitial.ip;
      this.form.port = this.syslogInitial.port;
    },
    selectProtocol() {
      this.resetEmail();
      this.resetIp();
      this.resetPort();
      this.resetSyslog();

      const newProtocol = this.form.protocol;
      if (newProtocol === 'SyslogTCP') this.setSyslogTCPInitial();
    },
    resetIp() {
      this.form.ip = '';
      this.$v.form.ip.$reset();
    },
    resetPort() {
      this.form.port = '';
      this.$v.form.port.$reset();
    },
    resetEmail() {
      this.form.email = '';
      this.$v.form.email.$reset();
    },
    resetSyslog() {
      this.form.syslog = 'SyslogTCP';
    },
    submitFormSubscription() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.startLoader();

      let subscriptionForm = {
        protocol:
          this.form.protocol != 'Syslog'
            ? this.form.protocol
            : this.form.syslog,
      };

      let destination;
      if (this.form.protocol != 'Syslog')
        destination = this.protocolFormats[this.form.protocol];
      else destination = this.protocolFormats[this.form.syslog];
      if (destination != 'smtp') {
        destination += '://' + this.form.ip + ':' + this.form.port;
      } else {
        destination = this.form.email;
        subscriptionForm.lowestSeverity = this.form.lowestSeverity;
      }
      subscriptionForm.destination = destination;

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
