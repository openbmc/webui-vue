<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageFactoryReset.pageDescription')" />
    <b-row class="mb-4">
      <b-col md="10" xl="10">
        <alert variant="warning" class="mb-4">
          <h5 class="mb-0">{{ $t('pageFactoryReset.alert.title') }}</h5>
          <span>{{ $t('pageFactoryReset.alert.message') }}</span>
        </alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="10" xl="10" class="mb-3">
        <b-card>
          <template #header>
            <div class="d-md-flex justify-content-between align-items-center">
              <div class="mb-3 mb-md-0">
                <h5>{{ $t('pageFactoryReset.resetHypervisorSettings') }}</h5>
                <span>{{
                  $t('pageFactoryReset.resetHypervisorSettingsInfo')
                }}</span>
              </div>
              <b-button
                variant="link"
                type="button"
                @click="initModalResetHypevisorSettings()"
              >
                {{ $t('pageFactoryReset.resetHypervisorSettings') }}
              </b-button>
            </div>
          </template>
          <dl class="mb-0">
            <dt>{{ $t('pageFactoryReset.affectedSettings') }}</dt>
            <dd class="mb-0">
              {{ $t('pageFactoryReset.affectedSettingsOnly') }}
            </dd>
          </dl>
        </b-card>
      </b-col>
      <b-col md="10" xl="10">
        <b-card>
          <template #header>
            <div class="d-md-flex justify-content-between align-items-center">
              <div class="mb-3 mb-md-0">
                <h5>{{ $t('pageFactoryReset.resetAllSettings') }}</h5>
                <span>{{ $t('pageFactoryReset.resetAllSettingsInfo') }}</span>
              </div>
              <b-button
                variant="link"
                type="button"
                @click="initModalResetBmcHypevisorSettings()"
              >
                {{ $t('pageFactoryReset.resetBmcHypervisorSettings') }}
              </b-button>
            </div>
          </template>
          <dl class="mb-0">
            <dt>{{ $t('pageFactoryReset.affectedSettings') }}</dt>
            <dd class="mb-0">
              {{ $t('pageFactoryReset.affectedSettingsAll') }}
            </dd>
          </dl>
        </b-card>
      </b-col>
    </b-row>
    <!-- Modals -->
    <modal-reset-hypevisor-settings />
    <modal-reset-bmc-hypevisor-settings />
  </b-container>
</template>

<script>
import Alert from '@/components/Global/Alert';
import PageTitle from '@/components/Global/PageTitle';
import ModalResetHypevisorSettings from './ModalResetHypevisorSettings';
import ModalResetBmcHypevisorSettings from './ModalResetBmcHypevisorSettings';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'FactoryReset',
  components: {
    Alert,
    PageTitle,
    ModalResetHypevisorSettings,
    ModalResetBmcHypevisorSettings,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  methods: {
    initModalResetHypevisorSettings() {
      this.$bvModal.show('reset-hypevisor-settings');
    },
    initModalResetBmcHypevisorSettings() {
      this.$bvModal.show('reset-bmc-hypevisor-settings');
    },
  },
};
</script>
