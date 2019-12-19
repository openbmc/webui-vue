<template>
  <b-container fluid>
    <PageTitle />
    <b-row>
      <b-col lg="8" sm="12">
        <PageSection sectionTitle="Server Information">
          <b-row>
            <b-col sm="6">
              <dl>
                <dt>MODEL</dt>
                <dd>{{ system.Model || "N/A" }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>MANUFACTURER</dt>
                <dd>{{ system.Manufacturer || "N/A" }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>SERIAL NUMBER</dt>
                <dd>{{ system.SerialNumber || "N/A" }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>FIRMWARE VERSION</dt>
                <dd>{{ software.Version || "N/A" }}</dd>
              </dl>
            </b-col>
          </b-row>
        </PageSection>
        <PageSection sectionTitle="BMC information">
          <b-row>
            <b-col sm="6">
              <dl>
                <dt>HOSTNAME</dt>
                <dd>{{ network.config.HostName || "N/A" }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>MAC ADDRESS</dt>
                <dd>{{ network.eth0.MACAddress || "N/A" }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>IP ADDRESS</dt>
                <dd>{{ network.ipv4.Address || "N/A" }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>FIRMWARE VERSION</dt>
                <dd>{{ logging.entry.Version || "N/A" }}</dd>
              </dl>
            </b-col>
          </b-row>
        </PageSection>
        <PageSection sectionTitle="Power consumption">
          <b-row>
            <b-col sm="6">
              <dl>
                <dt>POWER CONSUMPTION</dt>
                <dd>{{ total_power.description || "N/A" }}</dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>POWER CAP</dt>
                <dd v-if="!power_cap.PowerCapEnable">Not enabled</dd>
                <dd v-else>{{ power_cap.PowerCap }}</dd>
              </dl>
            </b-col>
          </b-row>
        </PageSection>
      </b-col>
      <b-col lg="4" sm="12">
        <quickLinks />
      </b-col>
    </b-row>
    <PageSection sectionTitle="High priority events">
      <events />
    </PageSection>
  </b-container>
</template>

<script>
import OverviewQuickLinks from "./OverviewQuickLinks";
import OverviewEvents from "./OverviewEvents";
import PageTitle from "../../components/Global/PageTitle";
import PageSection from "../../components/Global/PageSection";

export default {
  name: "Overview",
  components: {
    quickLinks: OverviewQuickLinks,
    events: OverviewEvents,
    PageTitle,
    PageSection
  },
  data() {
    return {
      logging: {
        entry: {
          Description:
            "An internal failure has occurred while performing an operation.",
          EventID: "ABCDEF123",
          Id: 1,
          Resolved: false,
          Severity: "CRITICAL",
          Timestamp: 1574782085071,
          Version: "openbmc-v1.0.0"
        }
      },
      network: {
        config: {
          HostName: "Name of the Host"
        },
        eth0: {
          MACAddress: "00:00:00:00:00:00"
        },
        ipv4: {
          Address: "00.00.00.00"
        }
      },
      power_cap: {
        PowerCap: 0,
        PowerCapEnable: false
      },
      software: {
        Version: "OPENBMC-v1"
      },
      system: {
        Manufacturer: "",
        Model: "0000000000000000",
        SerialNumber: "0000000000000000"
      },
      total_power: {
        description: "0"
      }
    };
  }
};
</script>
