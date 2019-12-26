<template>
  <b-nav vertical>
    <b-nav-item to="/"><icon-overview />Overview</b-nav-item>

    <li class="nav-item">
      <b-button v-b-toggle.health-menu variant="link">
        <icon-health />Health
        <icon-expand class="icon-expand" />
      </b-button>
      <b-collapse tag="ul" id="health-menu" class="nav-item__nav">
        <b-nav-item href="javascript:void(0)">Event Log</b-nav-item>
        <b-nav-item href="javascript:void(0)">Hardware Status</b-nav-item>
        <b-nav-item href="javascript:void(0)">Sensors</b-nav-item>
      </b-collapse>
    </li>

    <li class="nav-item">
      <b-button v-b-toggle.control-menu variant="link">
        <icon-control />Control
        <icon-expand class="icon-expand" />
      </b-button>
      <b-collapse tag="ul" id="control-menu" class="nav-item__nav">
        <b-nav-item href="javascript:void(0)">
          Server power operations
        </b-nav-item>
        <b-nav-item href="javascript:void(0)">Manage power usage</b-nav-item>
        <b-nav-item href="javascript:void(0)">Server LED</b-nav-item>
      </b-collapse>
    </li>

    <li class="nav-item">
      <b-button v-b-toggle.configuration-menu variant="link">
        <icon-configuration />Configuration
        <icon-expand class="icon-expand" />
      </b-button>
      <b-collapse tag="ul" id="configuration-menu" class="nav-item__nav">
        <b-nav-item href="javascript:void(0)">Network settings</b-nav-item>
        <b-nav-item href="javascript:void(0)">SNMP settings</b-nav-item>
        <b-nav-item href="javascript:void(0)">Firmware</b-nav-item>
      </b-collapse>
    </li>

    <li class="nav-item">
      <b-button v-b-toggle.access-control-menu variant="link">
        <icon-access-control />Access Control
        <icon-expand class="icon-expand" />
      </b-button>
      <b-collapse tag="ul" id="access-control-menu" class="nav-item__nav">
        <b-nav-item href="javascript:void(0)">LDAP</b-nav-item>
        <b-nav-item to="/access-control/local-user-management">
          Local user management
        </b-nav-item>
        <b-nav-item href="javascript:void(0)">SSL Certificates</b-nav-item>
      </b-collapse>
    </li>
  </b-nav>
</template>

<script>
import IconAnalytics from '@carbon/icons-vue/es/analytics/16';
import IconDataCheck from '@carbon/icons-vue/es/data--check/16';
import IconSettingsAdjust from '@carbon/icons-vue/es/settings--adjust/16';
import IconSettings from '@carbon/icons-vue/es/settings/16';
import IconPassword from '@carbon/icons-vue/es/password/16';
import IconChevronUp from '@carbon/icons-vue/es/chevron--up/16';

export default {
  name: 'AppNavigation',
  components: {
    iconOverview: IconAnalytics,
    iconHealth: IconDataCheck,
    iconControl: IconSettingsAdjust,
    iconConfiguration: IconSettings,
    iconAccessControl: IconPassword,
    iconExpand: IconChevronUp
  }
};
</script>

<style scoped lang="scss">
svg {
  fill: $gray-900;
  margin-left: 0 !important; //!important overriding button specificity
  vertical-align: text-bottom;
  &:not(.icon-expand) {
    margin-right: $spacer;
  }
}

.nav {
  min-height: 100%;
  padding-top: $spacer;
}

.nav-item__nav {
  list-style: none;
  padding-left: 0;
  margin-left: 0;

  .nav-link {
    padding-left: $spacer * 4;

    &:not(.nav-link--current) {
      font-weight: normal;
    }
  }
}

.btn-link {
  width: 100%;
  text-align: left;
  text-decoration: none !important;
  border-radius: 0;

  &.collapsed {
    .icon-expand {
      transform: rotate(180deg);
    }
  }

  &:focus {
    box-shadow: $btn-focus-box-shadow;
  }
}

.icon-expand {
  float: right;
  margin-top: $spacer / 4;
}

.btn-link,
.nav-link {
  position: relative;
  font-weight: $headings-font-weight;
  padding-left: $spacer; // defining consistent padding for links and buttons
  padding-right: $spacer;
  color: $gray-900 !important; //using important to avoid styling states

  &:hover {
    background-color: $gray-300;
  }
}

.nav-link--current {
  font-weight: $headings-font-weight;
  background-color: $gray-300;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background-color: $primary;
  }
}
</style>
