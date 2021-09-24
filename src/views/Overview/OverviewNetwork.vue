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
            {{ tableFormatter(staticAddress) }}
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

export default {
  name: 'Network',
  components: {
    OverviewCard,
  },
  mixins: [TableDataFormatterMixin],
  data() {
    return {
      hostname: '',
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
      this.hostname = data.HostName;
      this.linkStatus = data.LinkStatus;
      this.staticAddress = data.IPv4StaticAddresses[0].Address;
      const dhcp = data.IPv4Addresses.filter(
        (ipv4) => ipv4.AddressOrigin === 'DHCP'
      );
      this.ipDhcpAddress = dhcp[0]?.Address;
    },
  },
};
</script>
