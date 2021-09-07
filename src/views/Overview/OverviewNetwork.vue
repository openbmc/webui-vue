<template>
  <overview-card
    :title="$t('pageOverview.networkInformation')"
    :to="`/settings/network`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.hostname') }}</dt>
          <dd>{{ dataFormatter(hostname) }}</dd>
        </dl>
      </b-col>
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.linkStatus') }}</dt>
          <dd>
            {{ dataFormatter(linkStatus) }}
          </dd>
        </dl>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <dl>
          <dt>{{ $t('pageOverview.ipStaticAddress') }}</dt>
          <dd>
            {{ dataFormatter(ipStaticAddress) }}
          </dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { mapState } from 'vuex';

export default {
  name: 'Network',
  components: {
    OverviewCard,
  },
  mixins: [DataFormatterMixin],
  computed: {
    ...mapState({
      ethernetData: (state) => state.network.ethernetData[0],
      hostname() {
        if (this.ethernetData) return this.ethernetData.HostName;
      },
      linkStatus() {
        if (this.ethernetData) return this.ethernetData.LinkStatus;
      },
      ipStaticAddress() {
        if (this.ethernetData)
          return this.ethernetData.IPv4Addresses[0].Address;
      },
    }),
  },
  created() {
    this.$store.dispatch('network/getEthernetData').finally(() => {
      this.$root.$emit('overview-network-complete');
    });
  },
};
</script>
