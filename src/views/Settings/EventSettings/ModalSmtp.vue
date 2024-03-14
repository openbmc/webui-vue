<template>
  <b-modal id="modal-smtp" ref="modal" @hidden="resetFormSmtp">
    <template #modal-title>
      {{ $t('pageEventSettings.settingsSMTP') }}
    </template>
    <b-form id="form-smtp" novalidate @submit.prevent="submitFormSMTP">
      <b-row>
        <b-col lg="6">
          <b-form-group>
            <b-form-checkbox
              id="smtp-service-enabled"
              v-model="form.serviceEnabled"
              data-test-id="eventsettings-smtp-service-enabled"
            >
              {{ $t('pageEventSettings.form.serviceEnabled') }}
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col lg="6">
          <b-form-group
            :label="$t('pageEventSettings.form.smtpHostname')"
            label-for="smtp-ip"
          >
            <b-form-input
              id="smtp-ip"
              v-model="form.ip"
              data-test-id="eventsettings-input-smtp-ip"
              type="text"
              :state="getValidationState($v.form.ip)"
              @input="$v.form.ip.$touch()"
            ></b-form-input>
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.ip.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
          <b-form-group
            :label="$t('pageEventSettings.form.port')"
            label-for="smtp-port-field"
          >
            <b-form-input
              id="smtp-port-field"
              v-model="form.port"
              data-test-id="eventsettings-input-smtp-port"
              type="text"
              :state="getValidationState($v.form.port)"
              @input="$v.form.port.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.port.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
          <b-form-group
            :label="$t('pageEventSettings.form.mailFrom')"
            label-for="smtp-mail-from"
          >
            <b-form-input
              id="smtp-mail-from"
              v-model="form.mailFrom"
              data-test-id="eventsettings-smtp-mail-from"
              type="text"
              :state="getValidationState($v.form.mailFrom)"
              @input="$v.form.mailFrom.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.mailFrom.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
        <b-col lg="6">
          <b-form-group
            :label="$t('pageEventSettings.form.authentication')"
            label-for="subscription-authentication"
          >
            <b-form-select
              id="subscription-authentication"
              v-model="form.authentication"
              data-test-id="eventsettings-subscription-authentication"
              :options="selectAuthentication"
              @change="changeAuthentication"
            />
          </b-form-group>
          <div v-if="form.authentication == 'Plain'">
            <b-form-group
              :label="$t('pageEventSettings.form.login')"
              label-for="smtp-login"
            >
              <b-form-input
                id="smtp-login"
                v-model="form.login"
                data-test-id="eventsettings-input-smtp-login"
                type="text"
                :state="getValidationState($v.form.login)"
                @input="$v.form.login.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.form.login.required">
                  {{ $t('global.form.fieldRequired') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
            <b-form-group
              :label="$t('pageEventSettings.form.password')"
              label-for="smtp-password"
            >
              <input-password-toggle>
                <b-form-input
                  id="smtp-password"
                  v-model="form.password"
                  data-test-id="eventsettings-input-smtp-password"
                  type="password"
                  :placeholder="passwordSet ? '●●●●●●●●●●' : ''"
                  :state="getValidationState($v.form.password)"
                  @input="$v.form.password.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.password.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
            <b-form-group>
              <b-row>
                <b-col lg="4" md="4">
                  <b-form-checkbox
                    id="smtp-tls"
                    v-model="form.tls"
                    data-test-id="eventsettings-checkbox-smtp-tls"
                    @change="changeTls"
                  >
                    TLS
                  </b-form-checkbox>
                </b-col>
                <b-col>
                  <b-form-checkbox
                    id="smtp-starttls"
                    v-model="form.startTls"
                    data-test-id="eventsettings-checkbox-smtp-starttls"
                    @change="changeStartTls"
                  >
                    START TLS
                  </b-form-checkbox>
                </b-col>
              </b-row>
            </b-form-group>
          </div>
        </b-col>
      </b-row>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="smtp-settings-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        form="form-smtp"
        data-test-id="button-savesmtpsettings"
        type="submit"
        variant="primary"
      >
        {{ $t('global.action.saveSettings') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import { required, requiredIf, helpers } from 'vuelidate/lib/validators';

const validateIp = helpers.regex(
  'validateIp',
  /^(?=.*[^.]$)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.?){4}|([A-Za-z0-9.].*)$/,
);

const validatePort = helpers.regex(
  'validatePort',
  /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
);

export default {
  components: {
    InputPasswordToggle,
  },
  mixins: [LoadingBarMixin, BVToastMixin, VuelidateMixin],
  data() {
    return {
      form: {
        serviceEnabled: false,
        ip: '',
        port: '',
        authentication: null,
        login: '',
        password: '',
        tls: false,
        startTls: false,
        mailFrom: '',
      },
      selectAuthentication: [
        { value: 'Plain', text: 'Plain' },
        { value: 'None', text: 'None' },
      ],
      smtpInitial: {},
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
        mailFrom: {
          required,
        },
        login: {
          required: requiredIf(() => this.form.authentication === 'Plain'),
        },
        password: {
          required: requiredIf(() => this.form.authentication === 'Plain'),
        },
      },
    };
  },
  computed: {
    passwordSet() {
      return this.$store.getters['eventSettings/getSmtpPasswordSet'];
    },
  },
  mounted() {
    this.$store.dispatch('eventSettings/getSmtpSettings');
    this.$root.$on('resetFormSmtp', () => {
      this.resetFormSmtp();
    });
  },
  methods: {
    resetFormSmtp() {
      this.$v.$reset();
      this.setSmtpInitial();
      this.form.serviceEnabled = this.smtpInitial.serviceEnabled;
      this.form.ip = this.smtpInitial.ip;
      this.form.port = this.smtpInitial.port;
      this.form.mailFrom = this.smtpInitial.mailFrom;
      this.form.authentication = this.smtpInitial.authentication;
      this.form.login = this.smtpInitial.username;
      this.form.password = '';
      this.form.tls = false;
      this.form.startTls = false;
      if (this.smtpInitial.connectionProtocol === 'TLS_SSL') {
        this.form.tls = true;
      } else if (this.smtpInitial.connectionProtocol === 'StartTLS') {
        this.form.tls = true;
        this.form.startTls = true;
      }
    },
    setSmtpInitial() {
      this.smtpInitial.serviceEnabled =
        this.$store.getters['eventSettings/getSmtpServiceEnabled'];
      this.smtpInitial.ip = this.$store.getters['eventSettings/getSmtpIp'];
      this.smtpInitial.port = this.$store.getters['eventSettings/getSmtpPort'];
      this.smtpInitial.mailFrom =
        this.$store.getters['eventSettings/getSmtpMailFrom'];
      this.smtpInitial.authentication =
        this.$store.getters['eventSettings/getSmtpAuthentication'];
      if (this.smtpInitial.authentication === 'Plain') {
        this.smtpInitial.username =
          this.$store.getters['eventSettings/getSmtpUsername'];
        this.smtpInitial.connectionProtocol =
          this.$store.getters['eventSettings/getSmtpConnectionProtocol'];
      }
    },
    submitFormSMTP() {
      this.$v.$touch();
      if (this.$v.$invalid) return;

      this.startLoader();

      let smtpServerSettings = {
        ip: this.form.ip,
        port: parseInt(this.form.port, 10),
        mailFrom: this.form.mailFrom,
        serviceEnabled: this.form.serviceEnabled,
        authentication: this.form.authentication,
        connectionProtocol: 'None',
      };

      if (this.form.authentication === 'Plain') {
        smtpServerSettings.login = this.form.login;
        smtpServerSettings.password = this.form.password;
      }

      if (this.form.tls) {
        smtpServerSettings.connectionProtocol = 'TLS_SSL';
        if (this.form.startTls)
          smtpServerSettings.connectionProtocol = 'StartTLS';
      }

      this.$store
        .dispatch('eventSettings/updateSmtpSettings', smtpServerSettings)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.$reset();
          this.endLoader();
        });
      this.resetFormSmtp();
      this.$bvModal.hide('modal-smtp');
    },
    changeStartTls(val) {
      if (val) this.form.tls = val;
    },
    changeTls(val) {
      if (!val) this.form.startTls = val;
    },
    changeAuthentication() {
      this.form.tls = false;
      this.form.startTls = false;
      this.form.login = this.smtpInitial.username;
      this.form.password = '';
      this.$v.form.login.$reset();
      this.$v.form.password.$reset();
    },
  },
};
</script>
