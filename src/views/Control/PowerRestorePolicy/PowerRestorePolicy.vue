<template>
  <b-container fluid="xl">
    <page-title :description="$t('pagePowerRestorePolicy.description')" />

    <b-row>
      <b-col sm="8" md="6" xl="12">
        <dl>
          <dt>{{ $t('pagePowerRestorePolicy.currentPolicy') }}</dt>
          <dd>
            {{ currentPowerRestorePolicy }}
          </dd>
        </dl>
      </b-col>
    </b-row>

    <b-row>
      <b-col sm="8" md="6" xl="12">
        <b-form-group :label="$t('pagePowerRestorePolicy.powerPoliciesLabel')">
          <b-form-radio
            v-for="policy in powerRestorePolicies"
            :key="policy.state"
            v-model="currentPowerRestorePolicy"
            :value="policy.state"
            name="power-restore-policy"
          >
            {{ policy.desc }}
          </b-form-radio>
        </b-form-group>
      </b-col>
    </b-row>

    <b-button
      variant="primary"
      type="submit"
      data-test-id="managePowerUsage-button-savePowerCapValue"
      @click="submitForm"
    >
      {{ $t('global.action.saveSettings') }}
    </b-button>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
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
      PolicyValue: null,
    };
  },
  computed: {
    ...mapGetters({
      powerRestorePolicies: 'powerControl/powerRestorePolicies',
    }),
    currentPowerRestorePolicy: {
      get() {
        return this.$store.getters['global/powerRestorePolicy'];
      },
      set(policy) {
        this.PolicyValue = policy;
      },
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('powerControl/getPowerRestorePolicy')
      .finally(() => this.endLoader());
  },
  methods: {
    submitForm() {
      if (!this.PolicyValue) return;
      this.startLoader();
      this.$store
        .dispatch('powerControl/setPowerRestorePolicy', this.PolicyValue)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
