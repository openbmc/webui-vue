<template>
  <b-container fluid>
    <PageTitle />
    <b-row>
      <b-col lg="8" sm="12">
        <PageSection sectionTitle="Server information">
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
        </PageSection>
        <PageSection sectionTitle="BMC information">
          <b-row>
            <b-col sm="6">
              <dl>
                <dt>Hostname</dt>
                <dd>{{ hostName }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>MAC address</dt>
                <dd>{{ macAddress }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>IP address</dt>
                <dd v-for="ip in ipAddress" v-bind:key="ip.id">{{ ip }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>Firmware version</dt>
                <dd>{{ bmcActiveVersion }}</dd>
              </dl>
            </b-col>
          </b-row>
        </PageSection>
        <PageSection sectionTitle="Power consumption">
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
        </PageSection>
      </b-col>
      <b-col lg="4" sm="12">
        <OverviewQuickLinks />
      </b-col>
    </b-row>
    <PageSection sectionTitle="High priority events">
      <OverviewEvents />
    </PageSection>
  </b-container>
</template>

<script>
import OverviewQuickLinks from "./OverviewQuickLinks";
import OverviewEvents from "./OverviewEvents";
import PageTitle from "../../components/Global/PageTitle";
import PageSection from "../../components/Global/PageSection";
import { mapState } from "vuex";
export default {
  name: "Overview",
  components: {
    OverviewQuickLinks,
    OverviewEvents,
    PageTitle,
    PageSection
  },
  created() {
    this.getOverviewInfo();
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
  methods: {
    getOverviewInfo() {
      this.$store.dispatch("overview/getServerInfo");
      this.$store.dispatch("global/getHostName");
      this.$store.dispatch("firmware/getFirmwareInfo");
      this.$store.dispatch("powerConsumption/getPowerData");
      this.$store.dispatch("powerCap/getPowerCapData");
      this.$store.dispatch("networkSettings/getNetworkData");
    }
  }
};
</script>
