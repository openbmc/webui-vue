<template>
  <b-container fluid="xl">
    <page-title :description="$t('pagePower.description')" />

    <b-row>
      <b-col sm="8" md="6" xl="12">
        <dl>
          <dt>{{ $t('pagePower.powerConsumption') }}</dt>
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
      <b-form-group :disabled="loading">
        <b-row>
          <b-col sm="8" md="6" xl="12">
            <b-form-group :label="$t('pagePower.powerCapSettingLabel')">
              <b-form-checkbox
                v-model="powerControlMode"
                data-test-id="power-checkbox-togglePowerCapField"
                name="power-control-mode"
              >
                {{ $t('pagePower.powerCapSettingData') }}
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col sm="8" md="6" xl="3">
            <b-form-group
              id="input-group-1"
              :label="$t('pagePower.powerCapLabel')"
              label-for="input-1"
            >
              <b-form-text id="power-help-text">
                {{
                  $t('pagePower.powerCapLabelTextInfo', {
                    min: 1,
                    max: 10000,
                  })
                }}
              </b-form-text>

              <b-form-input
                id="input-1"
                v-model="powerCapValue"
                data-test-id="power-input-powerCapValue"
                :number="true"
                type="number"
                aria-describedby="power-help-text"
                :state="getValidationState($v)"
              ></b-form-input>

              <b-form-invalid-feedback id="input-live-feedback" role="alert">
                <template v-if="!$v.powerControlMode.sameAs">
                  {{ $t('pagePower.form.applyPowerCap') }}
                </template>
                <template v-else-if="!$v.powerCapValue.between">
                  {{ $t('global.form.invalidValue') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <b-button
          variant="primary"
          type="submit"
          data-test-id="power-button-savePowerCapValue"
        >
          {{ $t('global.action.save') }}
        </b-button>
      </b-form-group>
    </b-form>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import { between, sameAs } from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';

export default {
  name: 'Power',
  components: { PageTitle },
  mixins: [VuelidateMixin, BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      loading,
      minLength: 1,
    };
  },
  computed: {
    ...mapGetters({
      powerConsumptionValue: 'powerControl/powerConsumptionValue',
    }),
    powerCapValue: {
      get() {
        return this.$store.getters['powerControl/powerCapValue'];
      },
      set(value) {
        this.$v.$touch();
        // Sent value must be typof Number or else it fails
        this.$store.dispatch('powerControl/setPowerCapUpdatedValue', value);
      },
    },
    powerControlMode: {
      get() {
        const newValue = this.getPowerControlModeValue();
        // It is better to keep the b-checkbox at default values of true/false
        // Not doing so may produce a bug
        return newValue === 'automatic' ? true : false;
      },
      set(value) {
        this.$v.$touch();
        const newValue = value === true ? 'automatic' : 'disabled';
        this.$store.dispatch(
          'powerControl/setPowerControlModeUpdatedValue',
          newValue
        );
        this.$store.dispatch('powerControl/setPowerControlMode', newValue);
      },
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('powerControl/getPowerControl')
      .finally(() => this.endLoader());
  },
  validations() {
    return {
      powerCapValue: {
        between: between(1, 10000),
      },
      powerControlMode: {
        sameAs: sameAs(() => true),
      },
    };
  },
  methods: {
    getPowerCapValue() {
      return this.$store.getters['powerControl/powerCapValue'];
    },
    getPowerControlModeValue() {
      return this.$store.getters['powerControl/powerControlModeValue'];
    },
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        if (this.powerControlMode === false) {
          this.errorToast(this.$t('pagePower.form.applyPowerCap'));
        }
        return;
      }
      this.startLoader();
      this.$store
        .dispatch('powerControl/setPowerCap', this.powerCapValue)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
