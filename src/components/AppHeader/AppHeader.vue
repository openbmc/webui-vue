<template>
  <div>
    <header id="page-header">
      <a role="link" class="link-skip-nav btn btn-light" href="#main-content">
        {{ $t('appHeader.skipToContent') }}
      </a>

      <b-navbar
        variant="dark"
        type="dark"
        :aria-label="$t('appHeader.applicationHeader')"
      >
        <!-- Left aligned nav items -->
        <b-button
          id="app-header-trigger"
          class="nav-trigger"
          aria-hidden="true"
          title="Open navigation"
          type="button"
          variant="link"
          :class="{ open: isNavigationOpen }"
          @click="toggleNavigation"
        >
          <icon-close v-if="isNavigationOpen" />
          <icon-menu v-if="!isNavigationOpen" />
        </b-button>
        <b-navbar-nav>
          <img v-if="logoEnabled" class="header-logo" :src="logo" alt="" />
          <b-nav-text>{{ $t('appHeader.bmcSystemManagement') }}</b-nav-text>
        </b-navbar-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto helper-menu">
          <b-nav-item to="/health/event-logs">
            <status-icon :status="healthStatusIcon" />
            {{ $t('appHeader.health') }}
          </b-nav-item>
          <b-nav-item to="/control/server-power-operations">
            <status-icon :status="hostStatusIcon" />
            {{ $t('appHeader.power') }}
          </b-nav-item>
          <!-- Using LI elements instead of b-nav-item to support semantic button elements -->
          <li class="nav-item">
            <b-button id="app-header-refresh" variant="link" @click="refresh">
              <icon-renew />
              <span class="responsive-text">{{ $t('appHeader.refresh') }}</span>
            </b-button>
          </li>
          <li class="nav-item">
            <b-dropdown id="app-header-user" variant="link" right>
              <template v-slot:button-content>
                <icon-avatar />
                <span class="responsive-text">{{ username }}</span>
              </template>
              <b-dropdown-item to="/profile-settings"
                >{{ $t('appHeader.profileSettings') }}
              </b-dropdown-item>
              <b-dropdown-item @click="logout">{{
                $t('appHeader.logOut')
              }}</b-dropdown-item>
            </b-dropdown>
          </li>
        </b-navbar-nav>
      </b-navbar>
    </header>
    <loading-bar />
  </div>
</template>

<script>
import IconAvatar from '@carbon/icons-vue/es/user--avatar/20';
import IconClose from '@carbon/icons-vue/es/close/20';
import IconMenu from '@carbon/icons-vue/es/menu/20';
import IconRenew from '@carbon/icons-vue/es/renew/20';
import StatusIcon from '../Global/StatusIcon';
import LoadingBar from '../Global/LoadingBar';

export default {
  name: 'AppHeader',
  components: {
    IconAvatar,
    IconClose,
    IconMenu,
    IconRenew,
    StatusIcon,
    LoadingBar
  },
  data() {
    return {
      isNavigationOpen: false,
      logoEnabled: process.env.VUE_APP_LOGO_HEADER,
      logo: `themes/${process.env.VUE_APP_THEME}/${process.env.VUE_APP_LOGO_HEADER}`
    };
  },
  computed: {
    hostStatus() {
      return this.$store.getters['global/hostStatus'];
    },
    healthStatus() {
      return this.$store.getters['eventLog/healthStatus'];
    },
    hostStatusIcon() {
      switch (this.hostStatus) {
        case 'on':
          return 'success';
        case 'error':
          return 'danger';
        case 'diagnosticMode':
          return 'warning';
        case 'off':
        default:
          return 'secondary';
      }
    },
    healthStatusIcon() {
      switch (this.healthStatus) {
        case 'OK':
          return 'success';
        case 'Warning':
          return 'warning';
        case 'Critical':
          return 'danger';
        default:
          return 'secondary';
      }
    },
    username() {
      return this.$store.getters['global/username'];
    }
  },
  created() {
    this.getHostInfo();
    this.getEvents();
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
    getEvents() {
      this.$store.dispatch('eventLog/getEventLogData');
    },
    refresh() {
      this.$emit('refresh');
    },
    logout() {
      this.$store.dispatch('authentication/logout');
    },
    toggleNavigation() {
      this.$root.$emit('toggle:navigation');
    }
  }
};
</script>

<style lang="scss">
@import 'src/assets/styles/helpers';

.app-header {
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
  .navbar-dark {
    .navbar-text,
    .nav-link,
    .btn-link {
      color: $white !important;
      fill: currentColor;
    }
  }

  .nav-item {
    fill: $light;
  }

  .navbar {
    padding: 0;
    @include media-breakpoint-up($responsive-layout-bp) {
      height: $header-height;
    }

    .btn-link {
      padding: $spacer / 2;
    }

    .header-logo {
      margin-right: $spacer / 2;
      width: auto;
      height: 40px;
    }

    .helper-menu {
      @include media-breakpoint-down(sm) {
        background-color: $gray-800;
        width: 100%;
        justify-content: flex-end;

        .nav-link,
        .btn {
          padding: $spacer / 1.125 $spacer / 2;
        }
      }

      .responsive-text {
        @include media-breakpoint-down(xs) {
          display: none;
        }
      }
    }
  }

  .navbar-nav {
    padding: 0 $spacer;
  }

  .nav-trigger {
    fill: $light;
    width: $header-height;
    height: $header-height;
    transition: none;

    svg {
      margin: 0;
    }

    &:hover {
      fill: $light;
      background-color: $dark;
    }

    &.open {
      background-color: $gray-800;
    }

    @include media-breakpoint-up($responsive-layout-bp) {
      display: none;
    }
  }

  .dropdown {
    .dropdown-menu {
      margin-top: 0;
      @include media-breakpoint-up(md) {
        margin-top: 7px;
      }
    }
  }

  .navbar-expand {
    @include media-breakpoint-down(sm) {
      flex-flow: wrap;
    }
  }
}
</style>
