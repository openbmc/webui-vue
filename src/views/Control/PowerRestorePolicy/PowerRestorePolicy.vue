<template>
  <b-container fluid="xl">
    <page-title :description="$t('pagePowerRestorePolicy.description')" />

    <b-row>
      <b-col sm="8" md="6" xl="12">
        <dl>
          <dt>{{ $t('pagePowerRestorePolicy.currentPolicy') }}</dt>
          <dd>
            <!-- {{
              powerConsumptionValue
                ? `${powerConsumptionValue} W`
                : $t('global.status.notAvailable')
            }} -->
          </dd>
        </dl>
      </b-col>
    </b-row>

    <b-row>
      <b-col sm="8" md="6" xl="12">
        <b-form-group :label="$t('pageManagePowerUsage.powerCapSettingLabel')">
          <b-form-checkbox
            v-model="isPowerCapFieldEnabled"
            data-test-id="managePowerUsage-checkbox-togglePowerCapField"
            name="power-cap-setting"
          >
            {{ $t('pageManagePowerUsage.powerCapSettingData') }}
          </b-form-checkbox>
        </b-form-group>
      </b-col>
    </b-row>

    <b-button
      variant="primary"
      type="submit"
      data-test-id="managePowerUsage-button-savePowerCapValue"
    >
      {{ $t('global.action.save') }}
    </b-button>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import { requiredIf, between } from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';

export default {
  name: 'PowerRestorePolicy',
  components: { PageTitle },
  mixins: [VuelidateMixin, BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      loading,
    };
  },
  computed: {
    ...mapGetters({
      powerConsumptionValue: 'powerControl/powerConsumptionValue',
    }),

    /**
      Computed property isPowerCapFieldEnabled is used to enable or disable the input field.
      The input field is enabled when the powercapValue property is not null.
   **/
    isPowerCapFieldEnabled: {
      get() {
        return this.powerCapValue !== null;
      },
      set(value) {
        let newValue = value ? '' : null;
        this.$v.$reset();
        this.$store.dispatch('powerControl/setPowerCapUpdatedValue', newValue);
      },
    },
    powerCapValue: {
      get() {
        return this.$store.getters['powerControl/powerCapValue'];
      },
      set(value) {
        this.$v.$touch();
        this.$store.dispatch('powerControl/setPowerCapUpdatedValue', value);
      },
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('powerControl/getPowerRestorePolicy')
      .finally(() => this.endLoader());
  },
  validations: {
    powerCapValue: {
      between: between(1, 10000),
      required: requiredIf(function () {
        return this.isPowerCapFieldEnabled;
      }),
    },
  },
  methods: {
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.startLoader();
      this.$store
        .dispatch('powerControl/setPowerControl', this.powerCapValue)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
