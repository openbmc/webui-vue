<template>
  <b-container fluid>
    <page-title />
    <div class="quicklinks-section">
      <overview-quick-links />
    </div>
    <b-row>
      <b-col>
        <page-section :section-title="$t('pageOverview.bmcInformation')">
          <b-row>
            <b-col>
              <dl>
                <dt>{{ $t('pageOverview.firmwareVersion') }}</dt>
                <dd>{{ bmcActiveVersion }}</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
        <b-row>
          <b-col>
            <page-section
              :section-title="$t('pageOverview.networkInformation')"
            >
              <overview-network />
            </page-section>
          </b-col>
        </b-row>
      </b-col>
      <b-col>
        <page-section :section-title="$t('pageOverview.serverInformation')">
          <b-row>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('pageOverview.model') }}</dt>
                <dd>{{ serverModel }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('pageOverview.manufacturer') }}</dt>
                <dd>{{ serverManufacturer }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('pageOverview.serialNumber') }}</dt>
                <dd>{{ serverSerialNumber }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('pageOverview.firmwareVersion') }}</dt>
                <dd>{{ hostActiveVersion }}</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
        <page-section :section-title="$t('pageOverview.powerConsumption')">
          <b-row>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('pageOverview.powerConsumption') }}</dt>
                <dd v-if="powerConsumptionValue == null">
                  {{ $t('global.status.notAvailable') }}
                </dd>
                <dd v-else>{{ powerConsumptionValue }} W</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('pageOverview.powerCap') }}</dt>
                <dd v-if="powerCapValue == null">
                  {{ $t('global.status.disabled') }}
                </dd>
                <dd v-else>{{ powerCapValue }} W</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
    <page-section :section-title="$t('pageOverview.highPriorityEvents')">
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
    powerCapValue: state => state.powerControl.powerCapValue,
    powerConsumptionValue: state => state.powerControl.powerConsumptionValue
  }),
  created() {
    this.getOverviewInfo();
  },
  methods: {
    getOverviewInfo() {
      this.$store.dispatch('overview/getServerInfo');
      this.$store.dispatch('global/getHostName');
      this.$store.dispatch('firmware/getFirmwareInfo');
      this.$store.dispatch('powerControl/getPowerControl');
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
