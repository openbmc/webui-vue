<template>
  <overview-card
    :title="$t('pageOverview.networkInformation')"
    :to="`/settings/network`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.hostname') }}</dt>
          <dd>{{ tableFormatter(hostname) }}</dd>
        </dl>
      </b-col>
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.linkStatus') }}</dt>
          <dd>
            {{ tableFormatter(linkStatus) }}
          </dd>
        </dl>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <dl>
          <dt>{{ $t('pageOverview.ipv4') }}</dt>
          <dd>
            {{ tableFormatter(ipStaticAddress) }}
          </dd>
        </dl>
      </b-col>
      <b-col>
        <dl>
          <dt>{{ $t('pageOverview.dhcp') }}</dt>
          <dd>
            {{ tableFormatter(ipDhcpAddress) }}
          </dd>
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
  name: 'Network',
  components: {
    OverviewCard,
  },
  mixins: [TableDataFormatterMixin],
  data() {
    return {
      ipDhcpAddress: '',
    };
  },
  computed: {
    ...mapState({
      ethernetData: (state) => state.network.ethernetData[0],
      hostname() {
        return this.ethernetData?.HostName;
      },
      linkStatus() {
        return this.ethernetData?.LinkStatus;
      },
      ipStaticAddress() {
        return this.ethernetData?.IPv4StaticAddresses[0].Address;
      },
    }),
  },
  created() {
    this.$store.dispatch('network/getEthernetData').finally(() => {
      this.$root.$emit('overview-network-complete');
    });
    this.getDhcpInfo();
  },
  methods: {
    getDhcpInfo() {
      const dhcp = this.ethernetData.IPv4Addresses.filter(
        (ipv4) => ipv4.AddressOrigin === 'DHCP'
      );
      this.ipDhcpAddress = dhcp[0].Address;
    },
  },
};
</script>
