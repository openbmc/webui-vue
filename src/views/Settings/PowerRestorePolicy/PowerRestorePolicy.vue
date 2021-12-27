<template>
  <b-container fluid="xl">
    <page-title :description="$t('pagePowerRestorePolicy.description')" />

    <b-row>
      <b-col sm="8" md="6" xl="12">
        <b-form-group :label="$t('pagePowerRestorePolicy.powerPoliciesLabel')">
          <b-form-radio
            v-for="policy in powerRestorePolicies"
            :key="policy.state"
            v-model="policyValue"
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
      :disabled="isLoading"
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
      isLoading: true,
      policyValue: null,
    };
  },
  computed: {
    powerRestorePolicies() {
      return this.$store.getters['powerPolicy/powerRestorePolicies'];
    },
  },
  created() {
    this.startLoader();
    Promise.all([
      this.$store.dispatch('powerPolicy/getPowerRestoreCurrentPolicy'),
      this.$store.dispatch('powerPolicy/getPowerRestorePolicies'),
    ])
      .then(() => this.getPowerRestoreCurrentPolicy())
      .finally(() => {
        this.endLoader();
        this.isLoading = false;
      });
  },
  methods: {
    getPowerRestoreCurrentPolicy() {
      const value = this.$store.getters[
        'powerPolicy/powerRestoreCurrentPolicy'
      ];
      this.policyValue = value;
    },
    submitForm() {
      this.startLoader();
      this.$store
        .dispatch(
          'powerPolicy/setPowerRestorePolicy',
          this.policyValue || this.powerRestoreCurrentPolicy
        )
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
