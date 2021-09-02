<template>
  <overview-card
    :title="$t('pageOverview.firmwareInformation')"
    :to="`/operations/firmware`"
  >
    <b-row class="mt-3">
      <b-col>
        <dl>
          <dt>{{ $t('pageOverview.runningVersion') }}</dt>
          <dd>{{ runningVersion }}</dd>
        </dl>
        <dl>
          <dt>{{ $t('pageOverview.backupVersion') }}</dt>
          <dd>{{ backupVersion }}</dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';

export default {
  name: 'Firmware',
  components: {
    OverviewCard,
  },
  computed: {
    backupBmcFirmware() {
      return this.$store.getters['firmware/backupBmcFirmware'];
    },
    backupVersion() {
      return this.backupBmcFirmware?.version || '--';
    },
    activeBmcFirmware() {
      return this.$store.getters[`firmware/activeBmcFirmware`];
    },
    runningVersion() {
      return this.activeBmcFirmware?.version || '--';
    },
  },
  created() {
    this.$store.dispatch('firmware/getFirmwareInformation').finally(() => {
      this.$root.$emit('overview-firmware-complete');
    });
  },
};
</script>
