<template>
  <b-modal id="modal-snmp" ref="modal" size="md" @hidden="resetFormSnmp">
    <template #modal-title>
      {{ $t('pageEventSettings.settingsSNMP') }}
    </template>
    <b-form id="form-snmp" novalidate @submit.prevent="submitFormSNMP">
      <b-row>
        <b-col lg="6">
          <b-form-group
            :label="$t('pageEventSettings.form.protocol')"
            label-for="snmp-protocol"
          >
            <b-form-select
              id="snmp-protocol"
              v-model="form.protocol"
              data-test-id="eventsettings-subscription-protocol"
              :options="snmpProtocols"
            />
          </b-form-group>
        </b-col>
      </b-row>

      <div v-if="form.protocol === 'SNMPv3'">
        <b-row>
          <b-col>
            <b-form-group
              :label="$t('pageEventSettings.form.securityLevel')"
              label-for="security-level"
            >
              <b-form-select
                id="security-level"
                v-model="form.securityLevel"
                data-test-id="eventsettings-security-level"
                :options="securityLevels"
                @change="clearKeys()"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-form-group
              :label="$t('pageEventSettings.form.engineId')"
              label-for="snmp-engine-id"
            >
              <b-form-input
                id="snmp-engine-id"
                v-model="form.engineId"
                data-test-id="eventsettings-input-snmp-engine-id"
                type="text"
                :state="getValidationState($v.form.engineId)"
                @input="$v.form.engineId.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.form.engineId.required">
                  {{ $t('global.form.fieldRequired') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-form-group
              :label="$t('pageEventSettings.form.username')"
              label-for="snmp-username"
            >
              <b-form-input
                id="snmp-username"
                v-model="form.username"
                data-test-id="eventsettings-input-snmp-username"
                type="text"
                :state="getValidationState($v.form.username)"
                @input="$v.form.username.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.form.username.required">
                  {{ $t('global.form.fieldRequired') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <div
          v-if="
            form.securityLevel === 'authNoPriv' ||
            form.securityLevel === 'authPriv'
          "
        >
          <b-row class="d-flex align-items-center">
            <b-col>
              <b-form-group
                :label="$t('pageEventSettings.form.authKey')"
                label-for="snmp-auth-key"
              >
                <b-form-input
                  id="snmp-auth-key"
                  v-model="form.authKey"
                  data-test-id="eventsettings-input-snmp-auth-key"
                  type="password"
                  :state="getValidationState($v.form.authKey)"
                  :placeholder="authKeyPlaceholder"
                  @input="$v.form.authKey.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.authKey.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                  <template v-else-if="!$v.form.authKey.validateKey">
                    {{ $t('pageEventSettings.validateKey') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group
                :label="$t('pageEventSettings.form.authProtocol')"
                label-for="snmp-auth-protocol"
              >
                <b-form-select
                  id="snmp-auth-protocol"
                  v-model="form.authProtocol"
                  data-test-id="eventsettings-input-snmp-auth-protocol"
                  type="text"
                  :state="getValidationState($v.form.authProtocol)"
                  :options="authProtocols"
                />
              </b-form-group>
            </b-col>
          </b-row>
        </div>

        <div v-if="form.securityLevel === 'authPriv'">
          <b-row class="d-flex align-items-center">
            <b-col>
              <b-form-group
                :label="$t('pageEventSettings.form.encryptKey')"
                label-for="snmp-encrypt-key"
              >
                <b-form-input
                  id="snmp-encrypt-key"
                  v-model="form.encryptKey"
                  data-test-id="eventsettings-input-snmp-encrypt-key"
                  type="password"
                  :state="getValidationState($v.form.encryptKey)"
                  :placeholder="encryptKeyPlaceholder"
                  @input="$v.form.encryptKey.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.encryptKey.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                  <template v-else-if="!$v.form.encryptKey.validateKey">
                    {{ $t('pageEventSettings.validateKey') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group
                :label="$t('pageEventSettings.form.encryptProtocol')"
                label-for="snmp-encrypt-protocol"
              >
                <b-form-select
                  id="snmp-encrypt-protocol"
                  v-model="form.encryptProtocol"
                  data-test-id="eventsettings-input-snmp-encrypt-protocol"
                  type="text"
                  :options="encryptProtocols"
                  :state="getValidationState($v.form.encryptProtocol)"
                  @input="$v.form.encryptProtocol.$touch()"
                />
              </b-form-group>
            </b-col>
          </b-row>
        </div>
      </div>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="snmp-settings-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        form="form-snmp"
        data-test-id="button-savesnmpsettings"
        type="submit"
        variant="primary"
        :disabled="keysNotChanged()"
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
import { requiredIf, helpers } from 'vuelidate/lib/validators';

const validateKey = helpers.regex('validateLength', /^[A-Za-z0-9]{10,}$/);

export default {
  mixins: [LoadingBarMixin, BVToastMixin, VuelidateMixin],
  data() {
    return {
      form: {
        protocol: null,
        engineId: null,
        username: null,
        authKey: null,
        authKeySet: false,
        securityLevel: null,
        oldSecurityLevel: null,
        authProtocol: null,
        encryptKey: null,
        encryptKeySet: false,
        encryptProtocol: null,
      },
      snmpProtocols: [
        { text: 'SNMPv3', value: 'SNMPv3' },
        { text: 'SNMPv2c', value: 'SNMPv2c' },
      ],
      securityLevels: [
        { text: 'noAuthNoPriv', value: 'noAuthNoPriv' },
        { text: 'authNoPriv', value: 'authNoPriv' },
        { text: 'authPriv', value: 'authPriv' },
      ],
      authProtocols: [{ text: 'SHA', value: 'SHA' }],
      encryptProtocols: [{ text: 'AES', value: 'AES' }],
    };
  },
  computed: {
    authKeyPlaceholder: {
      get() {
        return this.form.authKeySet === true ? '●●●●●●●●●●' : '';
      },
    },
    encryptKeyPlaceholder: {
      get() {
        return this.form.encryptKeySet === true ? '●●●●●●●●●●' : '';
      },
    },
  },
  validations() {
    return {
      form: {
        engineId: {
          required: requiredIf(() => this.form.protocol === 'SNMPv3'),
        },
        username: {
          required: requiredIf(() => this.form.protocol === 'SNMPv3'),
        },
        authProtocol: {
          required: requiredIf(
            () =>
              this.form.protocol === 'SNMPv3' &&
              this.form.changeAuthProtocol &&
              (this.form.securityLevel === 'authPriv' ||
                this.form.securityLevel === 'authNoPriv'),
          ),
        },
        authKey: {
          required: requiredIf(
            () =>
              this.form.protocol === 'SNMPv3' &&
              (this.form.changeAuthKey || !this.form.authKeySet) &&
              (this.form.securityLevel === 'authPriv' ||
                this.form.securityLevel === 'authNoPriv'),
          ),
          validateKey: validateKey,
        },
        encryptProtocol: {
          required: requiredIf(
            () =>
              this.form.protocol === 'SNMPv3' &&
              this.form.changeEncryptProtocol &&
              this.form.securityLevel === 'authPriv',
          ),
        },
        encryptKey: {
          required: requiredIf(
            () =>
              this.form.protocol === 'SNMPv3' &&
              (this.form.changeEncryptKey || !this.form.encryptKeySet) &&
              this.form.securityLevel === 'authPriv',
          ),
          validateKey: validateKey,
        },
      },
    };
  },
  mounted() {
    this.$store.dispatch('eventSettings/getSnmpSettings');
    this.$root.$on('resetFormSnmp', () => {
      this.resetFormSnmp();
    });
    this.resetFormSnmp();
  },
  methods: {
    clearKeys() {
      this.form.authKeySet = true;
      this.form.encryptKeySet = true;
      if (this.form.oldSecurityLevel != this.form.securityLevel) {
        this.form.authKey = '';
        this.form.encryptKey = '';
        this.form.authKeySet = false;
        this.form.encryptKeySet = false;
      }
    },
    keysNotChanged() {
      if (
        this.form.protocol === 'SNMPv3' &&
        this.form.securityLevel != 'noAuthNoPriv'
      ) {
        if (
          this.form.securityLevel === 'authPriv' &&
          (this.form.authKey === '' || this.form.encryptKey === '')
        )
          return true;
        else if (
          this.form.securityLevel === 'authNoPriv' &&
          this.form.authKey === ''
        )
          return true;
      }
      return false;
    },
    resetFormSnmp() {
      this.form.protocol = this.$store.getters['eventSettings/getSnmpProtocol'];
      this.form.engineId = this.$store.getters['eventSettings/getSnmpEngineId'];
      this.form.username = this.$store.getters['eventSettings/getSnmpUsername'];
      this.form.securityLevel =
        this.$store.getters['eventSettings/getSnmpSecurityLevel'];
      this.form.oldSecurityLevel = this.form.securityLevel;
      this.form.authProtocol =
        this.$store.getters['eventSettings/getSnmpAuthProtocol'];
      this.form.authKey = '';
      this.form.encryptProtocol =
        this.$store.getters['eventSettings/getSnmpEncryptProtocol'];
      this.form.encryptKey = '';

      this.form.authKeySet = false;
      this.form.encryptKeySet = false;
      if (this.form.securityLevel === 'authNoPriv') this.form.authKeySet = true;
      else if (this.form.securityLevel === 'authPriv') {
        this.form.authKeySet = true;
        this.form.encryptKeySet = true;
      }
    },
    submitFormSNMP() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.startLoader();

      let snmpSettingsForm = {
        protocol: this.form.protocol,
        lvl: this.form.securityLevel,
      };
      if (this.form.protocol === 'SNMPv3') {
        snmpSettingsForm.engineId = this.form.engineId;
        snmpSettingsForm.username = this.form.username;

        const lvl = this.form.securityLevel;

        if (lvl === 'authNoPriv' || lvl === 'authPriv') {
          snmpSettingsForm.authProtocol = this.form.authProtocol;
          if (this.form.authKey) snmpSettingsForm.authKey = this.form.authKey;

          if (lvl === 'authNoPriv') snmpSettingsForm.encryptKey = '';
          else {
            snmpSettingsForm.encryptProtocol = this.form.encryptProtocol;
            if (this.form.encryptKey)
              snmpSettingsForm.encryptKey = this.form.encryptKey;
          }
        } else {
          snmpSettingsForm.authKey = '';
          snmpSettingsForm.encryptKey = '';
        }
      }

      this.$store
        .dispatch('eventSettings/updateSnmpSettings', snmpSettingsForm)
        .then((success) => {
          this.successToast(success);
          this.$store.dispatch('eventSettings/getSubscriptions');
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.$reset();
          this.endLoader();
        });
      this.$bvModal.hide('modal-snmp');
    },
  },
};
</script>
