<template>
  <div>
    <div class="nav-container" :class="{ open: isNavigationOpen }">
      <nav ref="nav">
        <b-nav vertical>
          <b-nav-item to="/"><icon-overview />Overview</b-nav-item>

          <li class="nav-item">
            <b-button v-b-toggle.health-menu variant="link">
              <icon-health />Health
              <icon-expand class="icon-expand" />
            </b-button>
            <b-collapse id="health-menu" tag="ul" class="nav-item__nav">
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
            <b-collapse id="control-menu" tag="ul" class="nav-item__nav">
              <b-nav-item href="javascript:void(0)">
                Manage power usage
              </b-nav-item>
              <b-nav-item href="javascript:void(0)">Server LED</b-nav-item>
              <b-nav-item href="javascript:void(0)">
                Server power operations
              </b-nav-item>
            </b-collapse>
          </li>

          <li class="nav-item">
            <b-button v-b-toggle.configuration-menu variant="link">
              <icon-configuration />Configuration
              <icon-expand class="icon-expand" />
            </b-button>
            <b-collapse id="configuration-menu" tag="ul" class="nav-item__nav">
              <b-nav-item href="javascript:void(0)">Firmware</b-nav-item>
              <b-nav-item href="javascript:void(0)">
                Network settings
              </b-nav-item>
              <b-nav-item href="javascript:void(0)">SNMP settings</b-nav-item>
            </b-collapse>
          </li>

          <li class="nav-item">
            <b-button v-b-toggle.access-control-menu variant="link">
              <icon-access-control />Access Control
              <icon-expand class="icon-expand" />
            </b-button>
            <b-collapse id="access-control-menu" tag="ul" class="nav-item__nav">
              <b-nav-item href="javascript:void(0)">LDAP</b-nav-item>
              <b-nav-item to="/access-control/local-user-management">
                Local user management
              </b-nav-item>
              <b-nav-item href="javascript:void(0)">
                SSL Certificates
              </b-nav-item>
            </b-collapse>
          </li>
        </b-nav>
      </nav>
    </div>
    <transition name="fade">
      <div
        v-if="isNavigationOpen"
        class="nav-overlay"
        @click="toggleIsOpen"
      ></div>
    </transition>
  </div>
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
  },
  data() {
    return {
      isNavigationOpen: false
    };
  },
  watch: {
    $route: function() {
      this.isNavigationOpen = false;
    },
    isNavigationOpen: function(isNavigationOpen) {
      this.$root.$emit('change:isNavigationOpen', isNavigationOpen);
    }
  },
  mounted() {
    this.$root.$on('toggle:navigation', () => this.toggleIsOpen());
  },
  methods: {
    toggleIsOpen() {
      this.isNavigationOpen = !this.isNavigationOpen;
    }
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

  &:focus {
    box-shadow: $btn-focus-box-shadow;
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

.nav-container {
  position: fixed;
  width: $navigation-width;
  top: $header-height;
  bottom: 0;
  left: 0;
  z-index: $zindex-fixed;
  overflow-y: auto;
  background-color: $gray-200;
  transform: translateX(-$navigation-width);
  transition: transform $exit-easing--productive $duration--moderate-02;

  &.open {
    transform: translateX(0);
    transition-timing-function: $entrance-easing--productive;
  }

  @include media-breakpoint-up($responsive-layout-bp) {
    transition-duration: $duration--fast-01;
    transform: translateX(0);
  }
}

.nav-overlay {
  position: fixed;
  top: $header-height;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $zindex-fixed - 1;
  background-color: $black;
  opacity: 0.5;

  &.fade-enter-active {
    transition: opacity $duration--moderate-02 $entrance-easing--productive;
  }

  &.fade-leave-active {
    transition: opacity $duration--fast-02 $exit-easing--productive;
  }

  &.fade-enter,
  &.fade-leave-to {
    opacity: 0;
  }

  @include media-breakpoint-up($responsive-layout-bp) {
    display: none;
  }
}
</style>
