<template>
  <b-container fluid="xl">
    <page-title />
    <alerts-server-power
      v-if="isServerPowerOffRequired"
      :is-host-off="isHostOff"
    />

    <!-- Firmware cards -->
    <b-row>
      <b-col xl="10">
        <!-- BMC Firmware -->
        <bmc-cards :is-page-disabled="isPageDisabled" />

        <!-- Host Firmware -->
        <host-cards v-if="!isSingleFileUploadEnabled" />
      </b-col>
    </b-row>

    <!-- Update firmware-->
    <page-section
      :section-title="
        $t('pageFirmware.singleFileUpload.sectionTitleUpdateFirmware')
      "
    >
      <b-row>
        <b-col sm="8" md="6" xl="4">
          <!-- Update form -->
          <form-update
            :is-host-off="isHostOff"
            :is-page-disabled="isPageDisabled"
          />
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import AlertsServerPower from './FirmwareAlertServerPower';
import BmcCards from './FirmwareCardsBmc';
import FormUpdate from './FirmwareFormUpdate';
import HostCards from './FirmwareCardsHost';
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';

import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'FirmwareSingleImage',
  components: {
    AlertsServerPower,
    BmcCards,
    FormUpdate,
    HostCards,
    PageSection,
    PageTitle,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      loading,
      isServerPowerOffRequired:
        process.env.VUE_APP_SERVER_OFF_REQUIRED === 'true',
    };
  },
  computed: {
    hostStatus() {
      return this.$store.getters['global/hostStatus'];
    },
    isHostOff() {
      return this.hostStatus === 'off' ? true : false;
    },
    isSingleFileUploadEnabled() {
      return this.$store.getters[
        'firmwareSingleImage/isSingleFileUploadEnabled'
      ];
    },
    isPageDisabled() {
      if (this.isServerPowerOffRequired) {
        return !this.isHostOff || this.loading || this.isOperationInProgress;
      }
      return this.loading || this.isOperationInProgress;
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('firmwareSingleImage/getFirmwareInformation')
      .finally(() => this.endLoader());
  },
};
</script>
