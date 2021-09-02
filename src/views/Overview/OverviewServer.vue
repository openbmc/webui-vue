<template>
  <overview-card
    :title="$t('pageOverview.serverInformation')"
    :to="`/hardware-status/inventory`"
  >
    <b-row class="mt-3">
      <b-col lg="6">
        <dl>
          <dt>{{ $t('pageOverview.model') }}</dt>
          <dd>{{ serverModel }}</dd>
        </dl>
        <dl>
          <dt>{{ $t('pageOverview.serialNumber') }}</dt>
          <dd>{{ serverSerialNumber }}</dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import { mapState } from 'vuex';

export default {
  name: 'Server',
  components: {
    OverviewCard,
  },
  computed: {
    ...mapState({
      server: (state) => state.system.systems[0],
      serverManufacturer() {
        if (this.server) return this.server.manufacturer || '--';
        return '--';
      },
      serverModel() {
        if (this.server) return this.server.model || '--';
        return '--';
      },
      serverSerialNumber() {
        if (this.server) return this.server.serialNumber || '--';
        return '--';
      },
    }),
  },
  created() {
    this.$store.dispatch('system/getSystem').finally(() => {
      this.$root.$emit('overview-server-complete');
    });
  },
};
</script>
