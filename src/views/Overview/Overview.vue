<template>
  <b-container fluid>
    <page-title />
    <div class="quicklinks-section">
      <overview-quick-links />
    </div>
    <b-row>
      <b-col>
        <page-section section-title="BMC information">
          <b-row>
            <b-col>
              <dl>
                <dt>Firmware version</dt>
                <dd>{{ bmcActiveVersion }}</dd>
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
                <dt>Model</dt>
                <dd>{{ serverModel }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>Manufacturer</dt>
                <dd>{{ serverManufacturer }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>Serial number</dt>
                <dd>{{ serverSerialNumber }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>Firmware version</dt>
                <dd>{{ hostActiveVersion }}</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
        <page-section section-title="Power consumption">
          <b-row>
            <b-col sm="6">
              <dl>
                <dt>Power consumption</dt>
                <dd>{{ powerConsumption }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>Power cap</dt>
                <dd>{{ powerCapValue }}</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
    <page-section section-title="High priority events">
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
    hostActiveVersion: state => state.firmware.hostActiveVersion,
    bmcActiveVersion: state => state.firmware.bmcActiveVersion,
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
      this.$store.dispatch('firmware/getFirmwareInfo');
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
