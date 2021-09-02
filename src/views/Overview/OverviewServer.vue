<template>
  <overview-card
    :title="$t('pageOverview.serverInformation')"
    :to="`/hardware-status/inventory`"
  >
    <b-row class="mt-3">
      <b-col lg="6">
        <dl>
          <dt>{{ $t('pageOverview.model') }}</dt>
          <dd>{{ tableFormatter(serverModel) }}</dd>
          <dt>{{ $t('pageOverview.serialNumber') }}</dt>
          <dd>{{ tableFormatter(serverSerialNumber) }}</dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';
import { mapState } from 'vuex';

export default {
  name: 'Server',
  components: {
    OverviewCard,
  },
  mixins: [TableDataFormatterMixin],
  computed: {
    ...mapState({
      server: (state) => state.system.systems[0],
      serverModel() {
        return this.server?.model;
      },
      serverSerialNumber() {
        return this.server?.serialNumber;
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
