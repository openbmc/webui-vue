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
          @click="toggleNavigation"
        >
          <icon-close v-if="isNavigationOpen" />
          <icon-menu v-if="!isNavigationOpen" />
        </b-button>
        <b-navbar-nav>
          <b-nav-text>{{ $t('appHeader.bmcSystemManagement') }}</b-nav-text>
        </b-navbar-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item>
            {{ $t('appHeader.health') }}
            <status-icon :status="healthStatusIcon" />
          </b-nav-item>
          <b-nav-item>
            {{ $t('appHeader.power') }}
            <status-icon :status="hostStatusIcon" />
          </b-nav-item>
          <!-- Using LI elements instead of b-nav-item to support semantic button elements -->
          <li class="nav-item">
            <b-button id="app-header-refresh" variant="link" @click="refresh">
              {{ $t('appHeader.refresh') }}
              <icon-renew />
            </b-button>
          </li>
          <li class="nav-item">
            <b-dropdown id="app-header-user" class="btn-link" right>
              <template v-slot:button-content>
                <icon-avatar />
                {{ username }}
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
  </div>
</template>

<script>
import IconAvatar from '@carbon/icons-vue/es/user--avatar/20';
import IconClose from '@carbon/icons-vue/es/close/20';
import IconMenu from '@carbon/icons-vue/es/menu/20';
import IconRenew from '@carbon/icons-vue/es/renew/20';
import StatusIcon from '../Global/StatusIcon';
import { mapGetters } from 'vuex';

export default {
  name: 'AppHeader',
  components: { IconAvatar, IconClose, IconMenu, IconRenew, StatusIcon },
  data() {
    return {
      isNavigationOpen: false
    };
  },
  computed: {
    ...mapGetters({
      username: 'authentication/getUsername'
    }),
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
        case 'off':
        default:
          return 'secondary';
      }
    },
    healthStatusIcon() {
      switch (this.healthStatus) {
        case 'good':
          return 'success';
        case 'warning':
          return 'warning';
        case 'critical':
          return 'danger';
        default:
          return 'secondary';
      }
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
  height: $header-height;

  .btn-link {
    padding: $spacer / 2;
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

  @include media-breakpoint-up($responsive-layout-bp) {
    display: none;
  }
}
</style>
