<template>
  <b-container fluid>
    <page-title />

    <b-row>
      <b-col sm="8" md="6" xl="7">
        <p>{{ $t('pageManagePowerUsage.subTitle') }}</p>
      </b-col>
    </b-row>

    <b-row>
      <b-col sm="8" md="6" xl="12">
        <dl>
          <dt>{{ $t('pageManagePowerUsage.powerConsumption') }}</dt>
          <dd>
            {{
              powerConsumptionValue
                ? `${powerConsumptionValue} W`
                : $t('global.status.notAvailable')
            }}
          </dd>
        </dl>
      </b-col>
    </b-row>

    <b-form @submit.prevent="submitForm">
      <b-row>
        <b-col sm="8" md="6" xl="12">
          <b-form-group
            :label="$t('pageManagePowerUsage.powerCapSettingLabel')"
          >
            <b-form-checkbox
              v-model="isPoweCapFieldNull"
              name="power-cap-setting"
            >
              {{ $t('pageManagePowerUsage.powerCapSettingData') }}
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col sm="8" md="6" xl="3">
          <b-form-group
            id="input-group-1"
            :label="$t('pageManagePowerUsage.powerCapLabel')"
            label-for="input-1"
          >
            <b-form-text id="power-help-text">
              {{
                $t('pageManagePowerUsage.powerCapLabelTextInfo', {
                  min: 350,
                  max: 2400
                })
              }}
            </b-form-text>

            <b-form-input
              id="input-1"
              :value="powerCapValue"
              :disabled="!isPoweCapFieldNull"
              type="number"
              aria-describedby="power-help-text"
              :state="getValidationState($v.powerCapValue)"
              @input="inputPowerCapValue"
            ></b-form-input>

            <b-form-invalid-feedback id="input-live-feedback">
              {{ $t('pageManagePowerUsage.invalidValue') }}
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>

      <b-button variant="primary" type="submit">
        {{ $t('global.action.save') }}
      </b-button>
    </b-form>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { mapGetters } from 'vuex';

export function validPowerCap(value) {
  return value === null || (value > 305 && value < 2400);
}

export default {
  name: 'ManagePowerUsage',
  components: { PageTitle },
  mixins: [VuelidateMixin],
  computed: {
    ...mapGetters({
      powerConsumptionValue: 'powerControl/powerConsumptionValue',
      powerCapValue: 'powerControl/powerCapValue'
    }),

    isPoweCapFieldNull: {
      get() {
        return this.powerCapValue !== null;
      },
      set(value) {
        let newValue = value ? '' : null;
        this.$v.$reset();
        this.$store.commit('powerControl/setPowerCapValue', newValue);
      }
    }
  },
  validations: {
    powerCapValue: {
      validPowerCap
    }
  },
  methods: {
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$store
        .dispatch('powerControl/setPowerControl', this.powerCapValue)
        .then(message => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    inputPowerCapValue(value) {
      this.$v.$touch();
      this.$store.commit('powerControl/setPowerCapValue', value);
    }
  }
};
</script>

<style lang="scss" scoped></style>
