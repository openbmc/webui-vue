<template>
  <b-container fluid>
    <page-title />
    <div class="quicklinks-section">
      <overview-quick-links />
    </div>
    <b-row>
      <b-col>
        <page-section
          :section-title="$t('overview.sectionTitle.serverInformation')"
        >
          <b-row>
            <b-col>
              <dl>
                <dt>Firmware version</dt>
                <dd>{{ bmcFirmwareVersion }}</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
        <b-row>
          <b-col>
            <page-section
              :section-title="$t('overview.sectionTitle.networkInformation')"
            >
              <overview-network />
            </page-section>
          </b-col>
        </b-row>
      </b-col>
      <b-col>
        <page-section section-title="Server information">
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
                <dd>{{ hostFirmwareVersion }}</dd>
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
                <dd v-if="!powerConsumption">
                  {{ $t('global.state.notAvailable') }}
                </dd>
                <dd v-else>{{ powerConsumption }} W</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('overview.powerCap') }}</dt>
                <dd v-if="powerCapData">{{ powerCapData }} W</dd>
                <dd v-else>{{ $t('global.state.notEnabled') }}</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
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
import OverviewNetwork from './OverviewNetwork';
import PageTitle from '../../components/Global/PageTitle';
import PageSection from '../../components/Global/PageSection';
import { mapState } from 'vuex';

export default {
  name: 'Overview',
  components: {
    OverviewQuickLinks,
    OverviewEvents,
    OverviewNetwork,
    PageTitle,
    PageSection
  },
  computed: mapState({
    serverModel: state => state.overview.serverModel,
    serverManufacturer: state => state.overview.serverManufacturer,
    serverSerialNumber: state => state.overview.serverSerialNumber,
    hostName: state => state.global.hostName,
    hostFirmwareVersion: state => state.firmware.hostFirmwareVersion,
    bmcFirmwareVersion: state => state.firmware.bmcFirmwareVersion,
    powerConsumption: state => state.powerConsumption.powerConsumption,
    powerCapValue: state => state.powerCap.powerCapValue
  }),
  created() {
    this.getOverviewInfo();
  },
  methods: {
    getOverviewInfo() {
      this.$store.dispatch('overview/getServerInfo');
      this.$store.dispatch('global/getHostName');
      this.$store.dispatch('firmware/getBmcFirmware');
      this.$store.dispatch('firmware/getHostFirmware');
      this.$store.dispatch('powerConsumption/getPowerData');
      this.$store.dispatch('powerCap/getPowerCapData');
    }
  }
};
</script>

<style lang="scss" scoped>
.quicklinks-section {
  margin-bottom: $spacer * 2;
  margin-left: $spacer * -1;
}

dd {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
