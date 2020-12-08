<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageFactoryReset.pageDescription')" />
    <b-row>
      <b-col xl="8">
        <b-form-group :label="$t('pageFactoryReset.resetOptions')">
          <b-form-radio v-model="resetSettings" :value="true">
            {{ $t('pageFactoryReset.resetOption1_label') }}
          </b-form-radio>
          <p class="pl-4 form-text mt-1">
            {{ $t('pageFactoryReset.resetOption1_description') }}
          </p>
          <b-form-radio v-model="resetSettings" :value="false">
            {{ $t('pageFactoryReset.resetOption2_label') }}
          </b-form-radio>
          <p class="pl-4 form-text mt-1">
            {{ $t('pageFactoryReset.resetOption2_description') }}
          </p>
        </b-form-group>
      </b-col>
      <b-col xl="12">
        <template v-if="resetSettings">
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
    <modal-reset-settings ref="ModalResetSettings" />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import ModalResetSettings from './ModalResetSettings';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'FactoryReset',
  components: {
    PageTitle,
    ModalResetSettings,
  },
  mixins: [LoadingBarMixin, BVToastMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      resetSettings: true,
    };
  },
  methods: {
    initModalResetHypervisorSettings() {
      this.$bvModal.show('modal-reset-settings');
      this.$refs.ModalResetSettings.hideBtn(true);
    },
    initModalResetBmcHypervisorSettings() {
      this.$bvModal.show('modal-reset-settings');
      this.$refs.ModalResetSettings.hideBtn(false);
    },
  },
};
</script>
