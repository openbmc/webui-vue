<template>
  <b-container fluid>
    <h1>Overview</h1>
    <b-row>
      <b-col lg="8" sm="12">
        <section>
          <h2>Server Information</h2>
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
        </section>
        <section>
          <h2>BMC information</h2>
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
        </section>
        <section>
          <h2>Power consumption</h2>
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
        </section>
      </b-col>
      <b-col lg="4" sm="12">
        <quickLinks />
      </b-col>
    </b-row>
    <section>
      <h2>High priority events</h2>
      <events />
    </section>
  </b-container>
</template>

<script>
import OverviewQuickLinks from "./OverviewQuickLinks";
import OverviewEvents from "./OverviewEvents";

export default {
  name: "Overview",
  components: {
    quickLinks: OverviewQuickLinks,
    events: OverviewEvents
  },
  data() {
    return {
      logging: {
        entry: {
          Description:
            "An internal failure has occurred while performing an operation.",
          EventID: "FQPSPCR0021F",
          Id: 1,
          Resolved: false,
          Severity: "xyz.openbmc_project.Logging.Entry.Level.Error",
          Timestamp: 1574782085071,
          Version: "ibm-v2.7.0-rc1-5-gfd9b55f-r19-1-g8c075d3"
        }
      },
      network: {
        config: {
          HostName: "witherspoon"
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
        Version: "IBM-witherspoon-OP9-v2.4-4.22"
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
