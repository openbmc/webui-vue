<template>
  <div>
    <div v-if="ethernetData.length === 0">
      {{ $t('global.status.notAvailable') }}
    </div>
    <div
      v-for="ethernetInterface in ethernetData"
      v-else
      :key="ethernetInterface.id"
    >
      <h3 class="h5 font-weight-bold">
        {{ ethernetInterface.Id }}
      </h3>
      <b-row>
        <b-col sm="12" lg="12" xl="4">
          <dl>
            <dt>{{ $t('pageOverview.network.hostname') }}</dt>
            <dd>{{ ethernetInterface.HostName }}</dd>
          </dl>
        </b-col>
        <b-col sm="6" lg="6" xl="4">
          <dl>
            <dt>{{ $t('pageOverview.network.macAddress') }}</dt>
            <dd>{{ ethernetInterface.MACAddress }}</dd>
          </dl>
        </b-col>
        <b-col sm="6" lg="6" xl="4">
          <dl>
            <dt>{{ $t('pageOverview.network.ipAddress') }}</dt>
            <dd
              v-for="(ip, $index) in ethernetInterface.IPv4Addresses"
              :key="$index"
            >
              {{ ip.Address }}
            </dd>
          </dl>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Network',
  computed: {
    ethernetData() {
      return this.$store.getters['networkSettings/ethernetData'];
    },
  },
  created() {
    this.$store.dispatch('networkSettings/getEthernetData').finally(() => {
      this.$root.$emit('overview-network-complete');
    });
  },
};
</script>

<style lang="scss" scoped>
dd {
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
