<template>
  <b-container fluid="xl">
    <page-title />

    <!-- Privilege alert - shown when user lacks required privileges -->
    <b-alert v-if="!privilegeCheck.allowed" variant="warning" :model-value="true">
      <strong>{{ $t('global.status.insufficientPrivileges') }}</strong>
      {{ $t('pageFirmware.alert.missingPrivileges', {
        privileges: privilegeCheck.missingPrivileges.join(', ')
      }) }}
    </b-alert>

    <alerts-server-power
      v-if="isServerPowerOffRequired"
      :is-server-off="isServerOff"
    />

    <!-- Firmware cards -->
    <b-row>
      <b-col xl="10">
        <!-- BMC Firmware -->
        <bmc-cards
          :is-page-disabled="isPageDisabled"
          :is-server-off="isServerOff"
        />

        <!-- Bios Firmware -->
        <bios-cards v-if="!isSingleFileUploadEnabled" />
      </b-col>
    </b-row>

    <!-- Update firmware-->
    <page-section
      :section-title="$t('pageFirmware.sectionTitleUpdateFirmware')"
    >
      <b-row>
        <b-col sm="8" md="6" xl="4">
          <!-- Update form -->
          <form-update
            :is-server-off="isServerOff"
            :is-page-disabled="isPageDisabled"
          />
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import { computed } from 'vue';
import AlertsServerPower from './FirmwareAlertServerPower';
import BmcCards from './FirmwareCardsBmc';
import FormUpdate from './FirmwareFormUpdate';
import BiosCards from './FirmwareCardsBios';
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import { usePrivilegeCheckEntity } from '@/api/privilege/endpointPrivileges';
import { useFirmwareInventory } from '@/api/composables/useFirmwareInventory';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'FirmwareSingleImage',
  components: {
    AlertsServerPower,
    BmcCards,
    FormUpdate,
    BiosCards,
    PageSection,
    PageTitle,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  setup() {
    // Firmware upload uses dynamically discovered HttpPushUri/MultipartHttpPushUri
    // Check privileges for UpdateService POST operations
    const privilegeCheck = usePrivilegeCheckEntity('UpdateService', 'POST');

    // Use Vue Query composable for firmware inventory (replaces Vuex dispatch)
    const firmware = useFirmwareInventory();

    return {
      privilegeCheck: computed(() => privilegeCheck.value),
      isSingleFileUploadEnabled: firmware.isSingleFileUploadEnabled,
      firmwareLoading: firmware.isLoading,
    };
  },
  data() {
    return {
      isServerPowerOffRequired:
        import.meta.env.VITE_SERVER_OFF_REQUIRED === 'true',
    };
  },
  computed: {
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    isOperationInProgress() {
      return this.$store.getters['controls/isOperationInProgress'];
    },
    isServerOff() {
      return this.serverStatus === 'off' ? true : false;
    },
    isPageDisabled() {
      // Disable if user lacks required privileges for firmware upload
      if (!this.privilegeCheck.allowed) return true;

      if (this.isServerPowerOffRequired) {
        return !this.isServerOff || this.firmwareLoading || this.isOperationInProgress;
      }
      return this.firmwareLoading || this.isOperationInProgress;
    },
  },
  created() {
    // Loading bar is now managed by Vue Query's isLoading state
    // Show loader while firmware data is being fetched
    this.startLoader();
    this.$watch('firmwareLoading', (loading) => {
      if (!loading) this.endLoader();
    }, { immediate: true });
  },
};
</script>
