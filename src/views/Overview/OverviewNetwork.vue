<template>
  <overview-card
    :title="$t('pageOverview.networkInformation')"
    :to="`/settings/network`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.hostname') }}</dt>
          <dd>{{ hostname }}</dd>
        </dl>
      </b-col>
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.linkStatus') }}</dt>
          <dd>
            {{ linkStatus }}
          </dd>
        </dl>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <dl>
          <dt>{{ $t('pageOverview.ipStaticAddress') }}</dt>
          <dd>
            {{ ipStaticAddress }}
          </dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';

export default {
  name: 'Network',
  components: {
    OverviewCard,
  },
  computed: {
    ethernetData() {
      return this.$store.getters['network/ethernetData'];
    },
    hostname() {
      return this.ethernetData[0]?.HostName || '--';
    },
    ipStaticAddress() {
      return this.ethernetData[0]?.IPv4Addresses[0].Address || '--';
    },
    linkStatus() {
      return this.ethernetData[0]?.LinkStatus || '--';
    },
  },
  created() {
    this.$store.dispatch('network/getEthernetData').finally(() => {
      this.$root.$emit('overview-network-complete');
    });
  },
};
</script>
