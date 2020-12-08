<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageFactoryReset.pageDescription')" />
    <b-row>
      <b-col xl="8">
        <b-form-group :label="$t('pageFactoryReset.resetOptions')">
          <b-form-radio v-model="resetHypervisorSettings" :value="true">
            {{ $t('pageFactoryReset.resetOption1_label') }}
          </b-form-radio>
          <p class="pl-4">
            {{ $t('pageFactoryReset.resetOption1_description') }}
          </p>
          <b-form-radio v-model="resetHypervisorSettings" :value="false">
            {{ $t('pageFactoryReset.resetOption2_label') }}
          </b-form-radio>
          <p class="pl-4">
            {{ $t('pageFactoryReset.resetOption2_description') }}
          </p>
        </b-form-group>
      </b-col>
      <b-col xl="12">
        <template v-if="resetHypervisorSettings">
          <b-button
            variant="primary"
            @click="initModalResetHypervisorSettings()"
          >
            {{ $t('pageFactoryReset.reset') }}
          </b-button>
        </template>
        <template v-else>
          <b-button
            variant="primary"
            @click="initModalResetBmcHypervisorSettings()"
          >
            {{ $t('pageFactoryReset.reset') }}
          </b-button>
        </template>
      </b-col>
    </b-row>
    <!-- Modals -->
    <modal-reset-hypervisor-settings ref="ModalResetHypervisorSettings" />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import ModalResetHypervisorSettings from './ModalResetHypervisorSettings';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'FactoryReset',
  components: {
    PageTitle,
    ModalResetHypervisorSettings,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      resetHypervisorSettings: true,
    };
  },
  methods: {
    initModalResetHypervisorSettings() {
      this.$bvModal.show('modal-reset-hypervisor-settings');
      this.$refs.ModalResetHypervisorSettings.hideBtn(true);
    },
    initModalResetBmcHypervisorSettings() {
      this.$bvModal.show('modal-reset-hypervisor-settings');
      this.$refs.ModalResetHypervisorSettings.hideBtn(false);
    },
  },
};
</script>
