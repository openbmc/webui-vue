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

    <b-form novalidate @submit.prevent="submitForm">
      <b-row>
        <b-col sm="8" md="6" xl="12">
          <b-form-group
            :label="$t('pageManagePowerUsage.powerCapSettingLabel')"
          >
            <b-form-checkbox
              v-model="isPowerCapValuePresent"
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
              {{ $t('pageManagePowerUsage.powerCapLabelTextInfo') }}
            </b-form-text>

            <b-form-input
              id="input-1"
              v-model="powerCapValue"
              :disabled="!isPowerCapValuePresent"
              :state="validation"
              type="number"
              aria-describedby="power-help-text"
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
import PageTitle from '../../../components/Global/PageTitle';

export default {
  name: 'ManagePowerUsage',
  components: { PageTitle },
  computed: {
    powerConsumptionValue() {
      return this.$store.getters['powerControl/powerConsumptionValue'];
    },

    powerCapValue: {
      get() {
        return this.$store.getters['powerControl/powerCapValue'];
      },
      set(value) {
        this.$store.commit('powerControl/setPowerCapValue', value);
      }
    },

    isPowerCapValuePresent: {
      get() {
        return this.powerCapValue !== null;
      },
      set(value = '') {
        let newValue = value ? '' : null;
        this.$store.commit('powerControl/setPowerCapValue', newValue);
      }
    },

    validation() {
      return (
        this.powerCapValue === null ||
        (this.powerCapValue > 305 && this.powerCapValue < 2400)
      );
    }
  },
  methods: {
    submitForm() {
      console.log('submit form');
    }
  }
};
</script>

<style lang="scss" scoped></style>
