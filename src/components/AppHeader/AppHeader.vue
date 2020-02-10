<template>
  <div>
    <a class="link-skip-nav btn btn-light" href="#main-content">
      Skip to content
    </a>
    <header id="page-header">
      <b-navbar variant="dark" type="dark">
        <!-- Left aligned nav items -->
        <b-button
          class="nav-trigger"
          aria-label="Open navigation"
          aria-controls="primary-navigation"
          title="Open navigation"
          type="button"
          variant="link"
          :aria-expanded="isNavigationOpen"
          :class="{ 'nav-open': isNavigationOpen }"
          @click="toggleNavigation"
        >
          <icon-close v-if="isNavigationOpen" />
          <icon-menu v-if="!isNavigationOpen" />
        </b-button>
        <b-navbar-nav>
          <b-nav-text>BMC System Management</b-nav-text>
        </b-navbar-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav>
            <b-nav-item>
              Health
              <status-icon :status="'danger'" />
            </b-nav-item>
            <b-nav-item>
              Power
              <status-icon :status="hostStatusIcon" />
            </b-nav-item>
            <b-nav-item>
              Refresh
              <icon-renew />
            </b-nav-item>
            <b-nav-item @click="logout">
              Logout
              <icon-avatar />
            </b-nav-item>
          </b-nav>
        </b-navbar-nav>
      </b-navbar>
    </header>
  </div>
</template>

<script>
import IconAvatar from '@carbon/icons-vue/es/user--avatar/20';
import IconClose from '@carbon/icons-vue/es/close/20';
import IconMenu from '@carbon/icons-vue/es/menu/20';
import IconRenew from '@carbon/icons-vue/es/renew/20';
import StatusIcon from '../Global/StatusIcon';

export default {
  name: 'AppHeader',
  components: { IconAvatar, IconClose, IconMenu, IconRenew, StatusIcon },
  data() {
    return {
      isNavigationOpen: false
    };
  },
  computed: {
    hostStatus() {
      return this.$store.getters['global/hostStatus'];
    },
    hostStatusIcon() {
      switch (this.hostStatus) {
        case 'on':
          return 'success';
        case 'error':
          return 'danger';
        case 'off':
        default:
          return 'secondary';
      }
    }
  },
  created() {
    this.getHostInfo();
  },
  mounted() {
    this.$root.$on(
      'change:isNavigationOpen',
      isNavigationOpen => (this.isNavigationOpen = isNavigationOpen)
    );
  },
  methods: {
    getHostInfo() {
      this.$store.dispatch('global/getHostStatus');
    },
    logout() {
      this.$store.dispatch('authentication/logout').then(() => {
        this.$router.push('/login');
      });
    },
    toggleNavigation() {
      this.$root.$emit('toggle:navigation');
    }
  }
};
</script>

<style lang="scss" scoped>
.link-skip-nav {
  position: absolute;
  top: -60px;
  left: 0.5rem;
  z-index: $zindex-popover;
  transition: $duration--moderate-01 $exit-easing--expressive;
  &:focus {
    top: 0.5rem;
    transition-timing-function: $entrance-easing--expressive;
  }
}
.nav-item {
  svg {
    fill: $light;
  }
}
</style>
