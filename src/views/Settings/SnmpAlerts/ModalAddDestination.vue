<template>
  <b-modal id="add-destination" ref="modal" @ok="onOk" @hidden="resetForm">
    <template #modal-title>
      {{ $t('pageSnmpAlerts.modal.addSnmpDestinationTitle') }}
    </template>
    <b-form id="form-destination">
      <b-container>
        <b-row>
          <b-col sm="6">
            <!-- Add new SNMP alert destination type -->
            <b-form-group
              :label="$t('pageSnmpAlerts.modal.ipaddress')"
              label-for="ip-address"
            >
              <b-form-input
                id="ip-Address"
                v-model="form.ipAddress"
                :state="getValidationState($v.form.ipAddress)"
                data-test-id="snmpAlerts-input-ipAddress"
                type="text"
                @blur="$v.form.ipAddress.$touch()"
              />

              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.form.ipAddress.required">
                  {{ $t('global.form.fieldRequired') }}
                </template>
                <template v-if="!$v.form.ipAddress.ipAddress">
                  {{ $t('global.form.invalidFormat') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group label-for="port">
              <template #label>
                {{ $t('pageSnmpAlerts.modal.port') }} -
                <span class="form-text d-inline">
                  {{ $t('global.form.optional') }}
                </span>
              </template>
              <b-form-input
                id="port"
                v-model="form.port"
                type="text"
                :state="getValidationState($v.form.port)"
                data-test-id="snmpAlerts-input-port"
                @blur="$v.form.port.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                <template
                  v-if="!$v.form.port.minLength || !$v.form.port.maxLength"
                >
                  {{
                    $t('global.form.valueMustBeBetween', {
                      min: 0,
                      max: 65535,
                    })
                  }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        form="form-user"
        type="submit"
        variant="primary"
        data-test-id="snmpAlerts-button-ok"
        @click="onOk"
      >
        {{ $t('pageSnmpAlerts.addDestination') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import {
  required,
  ipAddress,
  minValue,
  maxValue,
} from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  mixins: [VuelidateMixin],
  data() {
    return {
      form: {
        ipaddress: null,
        port: null,
      },
    };
  },
  validations() {
    return {
      form: {
        ipAddress: {
          required,
          ipAddress,
        },
        port: {
          minValue: minValue(0),
          maxValue: maxValue(65535),
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$emit('ok', {
        ipAddress: this.form.ipAddress,
        port: this.form.port,
      });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.ipAddress = '';
      this.form.port = '';
      this.$v.$reset();
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
