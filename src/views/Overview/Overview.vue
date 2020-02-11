<template>
  <b-container fluid>
    <page-title />
    <b-row>
      <b-col lg="8" sm="12">
        <page-section
          :section-title="$t('overview.sectionTitle.serverInformation')"
        >
          <b-row>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('overview.model') }}</dt>
                <dd>{{ serverModel }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('overview.manufacturer') }}</dt>
                <dd>{{ serverManufacturer }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('overview.serialNumber') }}</dt>
                <dd>{{ serverSerialNumber }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('overview.firmwareVersion') }}</dt>
                <dd>{{ hostActiveVersion }}</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
        <page-section
          :section-title="$t('overview.sectionTitle.bmcInformation')"
        >
          <b-row>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('overview.hostname') }}</dt>
                <dd>{{ hostName }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('overview.macAddress') }}</dt>
                <dd>{{ macAddress }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('overview.ipAddress') }}</dt>
                <dd v-for="ip in ipAddress" :key="ip.id">{{ ip }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('overview.firmwareVersion') }}</dt>
                <dd>{{ bmcActiveVersion }}</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
        <page-section
          :section-title="$t('overview.sectionTitle.powerConsumption')"
        >
          <b-row>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('overview.powerConsumption') }}</dt>
                <dd>{{ powerConsumption }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('overview.powerCap') }}</dt>
                <dd>{{ powerCapValue }}</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
      <b-col lg="4" sm="12">
        <overview-quick-links />
      </b-col>
    </b-row>
    <page-section
      :section-title="$t('overview.sectionTitle.highPriorityEvents')"
    >
      <overview-events />
    </page-section>
  </b-container>
</template>

<script>
import OverviewQuickLinks from './OverviewQuickLinks';
import OverviewEvents from './OverviewEvents';
import PageTitle from '../../components/Global/PageTitle';
import PageSection from '../../components/Global/PageSection';
import { mapState } from 'vuex';
export default {
  name: 'Overview',
  components: {
    OverviewQuickLinks,
    OverviewEvents,
    PageTitle,
    PageSection
  },
  computed: mapState({
    serverModel: state => state.overview.serverModel,
    serverManufacturer: state => state.overview.serverManufacturer,
    serverSerialNumber: state => state.overview.serverSerialNumber,
    hostName: state => state.global.hostName,
    hostActiveVersion: state => state.firmware.hostActiveVersion,
    bmcActiveVersion: state => state.firmware.bmcActiveVersion,
    powerConsumption: state => state.powerConsumption.powerConsumption,
    powerCapValue: state => state.powerCap.powerCapValue,
    ipAddress: state => state.networkSettings.ipAddress,
    macAddress: state => state.networkSettings.macAddress
  }),
  created() {
    this.getOverviewInfo();
  },
  methods: {
    getOverviewInfo() {
      this.$store.dispatch('overview/getServerInfo');
      this.$store.dispatch('global/getHostName');
      this.$store.dispatch('firmware/getFirmwareInfo');
      this.$store.dispatch('powerConsumption/getPowerData');
      this.$store.dispatch('powerCap/getPowerCapData');
      this.$store.dispatch('networkSettings/getNetworkData');
    }
  }
};
</script>
