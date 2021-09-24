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
          <dt>{{ $t('pageOverview.ipv4') }}</dt>
          <dd>
            {{ dataFormatter(ipStaticAddress) }}
          </dd>
        </dl>
      </b-col>
      <b-col>
        <dl>
          <dt>{{ $t('pageOverview.dhcp') }}</dt>
          <dd>
            {{ dataFormatter(ipDhcpAddress) }}
          </dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  name: 'Network',
  components: {
    OverviewCard,
  },
  mixins: [DataFormatterMixin],
  data() {
    return {
      hostName: '',
      ipDhcpAddress: '',
      linkStatus: '',
      staticAddress: '',
    };
  },
  computed: {
    ethernetData() {
      return this.$store.getters['network/ethernetData'];
    },
  },
  watch: {
    ethernetData: function () {
      this.getNetwork();
    },
  },
  created() {
    this.$store.dispatch('network/getEthernetData').finally(() => {
      this.$root.$emit('overview-network-complete');
    });
  },
  methods: {
    getNetwork() {
      const data = this.ethernetData[0];
      this.hostName = data.HostName;
      this.linkStatus = data.LinkStatus;
      this.staticAddress = data.IPv4StaticAddresses[0]?.Address;
      const dhcp = data.IPv4Addresses.filter(
        (ipv4) => ipv4.AddressOrigin === 'DHCP'
      );
      this.ipDhcpAddress = dhcp[0]?.Address;
    },
  },
};
</script>
