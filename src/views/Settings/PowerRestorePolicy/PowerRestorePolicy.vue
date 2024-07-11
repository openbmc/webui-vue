<template>
  <b-container fluid="xl">
    <page-title :description="$t('pagePowerRestorePolicy.description')" />

    <b-row>
      <b-col sm="8" md="6" xl="12">
        <b-form-group :label="$t('pagePowerRestorePolicy.powerPoliciesLabel')">
          <b-form-radio-group
            v-model="currentPowerRestorePolicy"
            :options="options"
            name="power-restore-policy"
            stacked
          ></b-form-radio-group>
        </b-form-group>
      </b-col>
    </b-row>

    <b-button variant="primary" type="submit" @click="submitForm">
      {{ $t('global.action.saveSettings') }}
    </b-button>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { useVuelidate } from '@vuelidate/core';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';

export default {
  name: 'PowerRestorePolicy',
  components: { PageTitle },
  mixins: [VuelidateMixin, BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  setup() {
    return {
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      $t: useI18n().t,
      policyValue: null,
      options: [],
    };
  },
  computed: {
    powerRestorePolicies() {
      return this.$store.getters['powerPolicy/powerRestorePolicies'];
    },
    currentPowerRestorePolicy: {
      get() {
        return this.$store.getters['powerPolicy/powerRestoreCurrentPolicy'];
      },
      set(policy) {
        this.policyValue = policy;
      },
    },
  },
  created() {
    this.startLoader();
    this.renderPowerRestoreSettings();
  },
  methods: {
    renderPowerRestoreSettings() {
      Promise.all([
        this.$store.dispatch('powerPolicy/getPowerRestorePolicies'),
        this.$store.dispatch('powerPolicy/getPowerRestoreCurrentPolicy'),
      ]).finally(() => {
        this.options.length = 0;
        this.powerRestorePolicies.map((item) => {
          this.options.push({
            text: i18n.global.t(
              `pagePowerRestorePolicy.policiesDesc.${item.state}`,
            ),
            value: `${item.state}`,
          });
        });
        this.endLoader();
      });
    },
    submitForm() {
      this.startLoader();
      this.$store
        .dispatch(
          'powerPolicy/setPowerRestorePolicy',
          this.policyValue || this.currentPowerRestorePolicy,
        )
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.renderPowerRestoreSettings();
        });
    },
  },
};
</script>
