<template>
  <overview-card
    :title="$t('pageOverview.firmwareInformation')"
    :to="`/operations/firmware`"
  >
    <b-row class="mt-3">
      <b-col>
        <dl>
          <dt>{{ $t('pageOverview.runningVersion') }}</dt>
          <dd>{{ tableFormatter(runningVersion) }}</dd>
          <dt>{{ $t('pageOverview.backupVersion') }}</dt>
          <dd>{{ tableFormatter(backupVersion) }}</dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';

export default {
  name: 'Firmware',
  components: {
    OverviewCard,
  },
  mixins: [TableDataFormatterMixin],
  computed: {
    backupBmcFirmware() {
      return this.$store.getters['firmware/backupBmcFirmware'];
    },
    backupVersion() {
      return this.backupBmcFirmware?.version;
    },
    activeBmcFirmware() {
      return this.$store.getters[`firmware/activeBmcFirmware`];
    },
    runningVersion() {
      return this.activeBmcFirmware?.version;
    },
  },
  created() {
    this.$store.dispatch('firmware/getFirmwareInformation').finally(() => {
      this.$root.$emit('overview-firmware-complete');
    });
  },
};
</script>
