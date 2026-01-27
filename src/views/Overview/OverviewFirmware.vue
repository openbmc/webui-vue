<template>
  <overview-card
    :title="$t('pageOverview.firmwareInformation')"
    :to="`/operations/firmware`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.runningVersion') }}</dt>
          <dd>{{ dataFormatter(runningVersion) }}</dd>
          <dt>{{ $t('pageOverview.backupVersion') }}</dt>
          <dd>{{ dataFormatter(backupVersion) }}</dd>
        </dl>
      </b-col>
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.firmwareVersion') }}</dt>
          <dd>{{ dataFormatter(firmwareVersion) }}</dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { useFirmwareInventory } from '@/api/composables/useFirmwareInventory';

export default {
  name: 'Firmware',
  components: {
    OverviewCard,
  },
  mixins: [DataFormatterMixin],
  setup() {
    const firmware = useFirmwareInventory();

    return {
      ActiveBmcFirmware: firmware.ActiveBmcFirmware,
      BackupBmcFirmware: firmware.BackupBmcFirmware,
      firmwareLoading: firmware.isLoading,
    };
  },
  computed: {
    server() {
      return this.$store.state.system.systems[0];
    },
    backupVersion() {
      return this.BackupBmcFirmware?.Version;
    },
    firmwareVersion() {
      return this.server?.firmwareVersion;
    },
    runningVersion() {
      return this.ActiveBmcFirmware?.Version;
    },
  },
  created() {
    // Watch for loading completion and emit event
    this.$watch(
      'firmwareLoading',
      (loading) => {
        if (!loading) {
          this.$eventBus.$emit('overview-firmware-complete');
        }
      },
      { immediate: true },
    );
  },
};
</script>
