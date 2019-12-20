<template>
  <b-nav vertical>
    <b-nav-item to="/"><Analytics16 /> Overview</b-nav-item>

    <li class="nav-item">
      <b-button v-b-toggle.health-menu variant="link">
        <DataCheck16 /> Health
      </b-button>

      <b-collapse tag="ul" id="health-menu">
        <b-nav-item href="javascript:void(0)">Event Log</b-nav-item>
        <b-nav-item href="javascript:void(0)">Hardware Status</b-nav-item>
        <b-nav-item href="javascript:void(0)">Sensors</b-nav-item>
      </b-collapse>
    </li>

    <li class="nav-item">
      <b-button v-b-toggle.control-menu variant="link">
        <SettingsAdjust16 />
        Control
      </b-button>
      <b-collapse tag="ul" id="control-menu">
        <b-nav-item href="javascript:void(0)"
          >Server power operations</b-nav-item
        >
        <b-nav-item href="javascript:void(0)">Manage power usage</b-nav-item>
        <b-nav-item href="javascript:void(0)">Server LED</b-nav-item>
      </b-collapse>
    </li>
    <li class="nav-item">
      <b-button v-b-toggle.configuration-menu variant="link">
        <Settings16 />
        Health
      </b-button>
      <b-collapse tag="ul" id="configuration-menu">
        <b-nav-item href="javascript:void(0)">Network settings</b-nav-item>
        <b-nav-item href="javascript:void(0)">SNMP settings</b-nav-item>
        <b-nav-item href="javascript:void(0)">Firmware</b-nav-item>
      </b-collapse>
    </li>

    <li class="nav-item">
      <b-button v-b-toggle.access-control-menu variant="link">
        <Password16 />
        Access Control
      </b-button>
      <b-collapse tag="ul" id="access-control-menu">
        <b-nav-item href="javascript:void(0)">LDAP</b-nav-item>
        <b-nav-item to="/access-control/local-user-management"
          >Local user management</b-nav-item
        >
        <b-nav-item href="javascript:void(0)">SSL Certificates</b-nav-item>
      </b-collapse>
    </li>
  </b-nav>
</template>

<script>
import Analytics16 from '@carbon/icons-vue/es/analytics/16';
import DataCheck16 from '@carbon/icons-vue/es/data--check/16';
import SettingsAdjust16 from '@carbon/icons-vue/es/settings--adjust/16';
import Settings16 from '@carbon/icons-vue/es/settings/16';
import Password16 from '@carbon/icons-vue/es/password/16';

export default {
  name: 'AppNavigation',
  components: {
    Analytics16,
    DataCheck16,
    SettingsAdjust16,
    Settings16,
    Password16
  }
};
</script>

<style scoped>
ul li ul {
  list-style: none;
  padding-left: 0;
  margin-left: 1rem;
}
</style>
