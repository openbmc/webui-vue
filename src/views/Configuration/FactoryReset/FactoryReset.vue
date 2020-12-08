<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageFactoryReset.pageDescription')" />
    <b-row class="mb-4">
      <b-col md="10" xl="10">
        <alert variant="warning" class="mb-4">
          <strong>{{ $t('pageFactoryReset.alert.title') }}</strong>
          <div>{{ $t('pageFactoryReset.alert.message') }}</div>
        </alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="10" xl="10" class="mb-3">
        <b-card>
          <template #header>
            <div class="d-md-flex justify-content-between align-items-center">
              <div class="mb-3 mb-md-0">
                <div class="h4">
                  {{ $t('pageFactoryReset.resetHypervisorSettings') }}
                </div>
                <div>
                  <span class="text-primary"><icon-information /></span>
                  {{ $t('pageFactoryReset.resetHypervisorSettingsInfo') }}
                </div>
              </div>
              <b-button
                variant="link"
                type="button"
                @click="initModalResetHypervisorSettings()"
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
                <div class="h4">
                  {{ $t('pageFactoryReset.resetAllSettings') }}
                </div>
                <div>
                  <span class="text-warning"><icon-warning-alt /></span>
                  {{ $t('pageFactoryReset.resetAllSettingsInfo') }}
                </div>
              </div>
              <b-button
                variant="link"
                type="button"
                @click="initModalResetBmcHypervisorSettings()"
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
    <modal-reset-hypervisor-settings ref="ModalResetHypervisorSettings" />
  </b-container>
</template>

<script>
import Alert from '@/components/Global/Alert';
import PageTitle from '@/components/Global/PageTitle';
import ModalResetHypervisorSettings from './ModalResetHypervisorSettings';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import IconInformation from '@carbon/icons-vue/es/information--filled/20';
import IconWarningAlt from '@carbon/icons-vue/es/warning--alt--filled/20';

export default {
  name: 'FactoryReset',
  components: {
    Alert,
    PageTitle,
    ModalResetHypervisorSettings,
    IconInformation,
    IconWarningAlt,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  methods: {
    initModalResetHypervisorSettings() {
      this.$bvModal.show('reset-hypervisor-settings');
      this.$refs.ModalResetHypervisorSettings.hideBtn(true);
    },
    initModalResetBmcHypervisorSettings() {
      this.$bvModal.show('reset-hypervisor-settings');
      this.$refs.ModalResetHypervisorSettings.hideBtn(false);
    },
  },
};
</script>
