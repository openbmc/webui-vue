<template>
  <div>
    <header id="page-header">
      <a
        class="link-skip-nav btn btn-light"
        href="#main-content"
        @click="setFocus"
      >
        {{ t('appHeader.skipToContent') }}
      </a>

      <b-navbar type="dark" :aria-label="t('appHeader.applicationHeader')">
        <!-- Left aligned nav items -->
        <b-button
          id="app-header-trigger"
          class="nav-trigger"
          aria-hidden="true"
          type="button"
          variant="link"
          :class="{ open: isNavigationOpen }"
          @click="toggleNavigation"
        >
          <icon-close
            v-if="isNavigationOpen"
            :title="t('appHeader.titleHideNavigation')"
          />
          <icon-menu
            v-if="!isNavigationOpen"
            :title="t('appHeader.titleShowNavigation')"
          />
        </b-button>
        <b-navbar-nav>
          <b-navbar-brand
            class="mr-0"
            to="/"
            data-test-id="appHeader-container-overview"
          >
            <img
              class="header-logo"
              src="@/assets/images/logo-header.svg"
              :alt="altLogo"
            />
          </b-navbar-brand>
          <div v-if="isNavTagPresent" :key="routerKey" class="pl-2 nav-tags">
            <span>|</span>
            <span class="pl-3 asset-tag">{{ assetTag }}</span>
            <span class="pl-3">{{ modelType }}</span>
            <span class="pl-3">{{ serialNumber }}</span>
          </div>
        </b-navbar-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto helper-menu">
          <b-nav-item
            to="/logs/event-logs"
            data-test-id="appHeader-container-health"
          >
            <status-icon :status="healthStatusIcon" />
            {{ t('appHeader.health') }}
          </b-nav-item>
          <b-nav-item
            to="/operations/server-power-operations"
            data-test-id="appHeader-container-power"
          >
            <status-icon status="serverStatusIcon" />
            {{ t('appHeader.power') }}
          </b-nav-item>
          <!-- Using LI elements instead of b-nav-item to support semantic button elements -->
          <li class="nav-item">
            <b-button
              id="app-header-refresh"
              variant="link"
              data-test-id="appHeader-button-refresh"
              @click="refresh"
            >
              <icon-renew :title="t('appHeader.titleRefresh')" />
              <span class="responsive-text">{{ t('appHeader.refresh') }}</span>
            </b-button>
          </li>
          <li class="nav-item">
            <b-dropdown
              id="app-header-user"
              variant="link"
              right
              data-test-id="appHeader-container-user"
            >
              <template #button-content>
                <icon-avatar :title="t('appHeader.titleProfile')" />
                <span class="responsive-text">{{ username }}</span>
              </template>
              <b-dropdown-item
                to="/profile-settings"
                data-test-id="appHeader-link-profile"
                >{{ t('appHeader.profileSettings') }}
              </b-dropdown-item>
              <b-dropdown-item
                data-test-id="appHeader-link-logout"
                @click="logout"
              >
                {{ t('appHeader.logOut') }}
              </b-dropdown-item>
            </b-dropdown>
          </li>
        </b-navbar-nav>
      </b-navbar>
    </header>
    <loading-bar />
  </div>
</template>

<script setup>
import { computed, ref, watch, provide, onMounted, inject } from 'vue';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconAvatar from '@carbon/icons-vue/es/user--avatar/20';
import IconClose from '@carbon/icons-vue/es/close/20';
import IconMenu from '@carbon/icons-vue/es/menu/20';
import IconRenew from '@carbon/icons-vue/es/renew/20';
import StatusIcon from '../Global/StatusIcon.vue';
// import LoadingBar from '@/components/Global/LoadingBar';
import { AuthenticationStore } from '../../store/modules/Authentication/AuthenticationStore';
import { GlobalStore } from '../../store/modules/GlobalStore';
import { EventLogStore } from '../../store/modules/Logs/EventLogStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps(['routerKey']);
const { errorToast } = BVToastMixin;

const Authentication = AuthenticationStore();
const globalStore = GlobalStore();
const eventLogStore = EventLogStore();

const isNavigationOpen = ref(false);
const altLogo = 'Built on OpenBMC';

const routerKey = ref(props.routerKey);

const assetTag = computed(() => globalStore.assetTag);
const isNavTagPresent = computed(
  () => assetTag.value || globalStore.modelType || globalStore.serialNumber
);
const modelType = computed(() => globalStore.modelType);
const serialNumber = computed(() => globalStore.serialNumber);
const isAuthorized = computed(() => globalStore.isAuthorized);
const userPrivilege = computed(() => globalStore.userPrivilege);
const serverStatus = computed(() => globalStore.serverStatus);
const healthStatus = computed(() => eventLogStore.getHealthStatus);
const serverStatusIcon = computed(() => {
  switch (serverStatus.value) {
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
});
const healthStatusIcon = computed(() => {
  switch (healthStatus) {
    case 'OK':
      return 'success';
    case 'Warning':
      return 'warning';
    case 'Critical':
      return 'danger';
    default:
      return 'secondary';
  }
});
const username = computed(() => {
  return globalStore.username;
});
const consoleWindow = computed(() => Authentication.consoleWindow);
onMounted(() => {
  watch('consoleWindow', () => {
    if (consoleWindow === false) this.$eventBus.$consoleWindow.close();
  });
  watch(isAuthorized, (newValue) => {
    if (newValue === false) {
      errorToast(this.t('global.toast.unAuthDescription'), {
        title: this.t('global.toast.unAuthTitle'),
      });
    }
  });
});

provide('change-is-navigation-open', (value) => {
  isNavigationOpen.value = value;
});
// onMounted(() => {
//   this.$root.$on(
//   'change-is-navigation-open',
//   (isNavigationOpen) => (this.isNavigationOpen = isNavigationOpen)
// );
// })

const getSystemInfo = () => {
  globalStore.getSystemInfo();
};
const toggleNavigation = () => {
  // this.$root.$emit('toggle-navigation');
};
const getEvents = () => {
  eventLogStore.getEventLogData();
};
const logout = () => {
  Authentication.logout();
};
Authentication.resetStoreState();
getSystemInfo();
getEvents();
</script>

<style scoped lang="scss">
@mixin focus-box-shadow($padding-color: $navbar-color, $outline-color: $white) {
  box-shadow:
    inset 0 0 0 3px $padding-color,
    inset 0 0 0 5px $outline-color;
}
.app-header {
  .link-skip-nav {
    position: absolute;
    top: -60px;
    left: 0.5rem;
    z-index: $zindex-popover;
    transition: 150ms cubic-bezier(0.4, 0.14, 1, 1);
    &:focus {
      top: 0.5rem;
      transition-timing-function: cubic-bezier(0, 0, 0.3, 1);
    }
  }
  .navbar-text .nav-link,
  .btn-link {
    color: color('white') !important;
    fill: currentColor;
    padding: 0.68rem 1rem !important;

    &:hover {
      background-color: theme-color-level(light, 10);
    }
    &:active {
      background-color: theme-color-level(light, 9);
    }
    &:focus {
      @include focus-box-shadow;
      outline: 0;
    }
  }

  .nav-item {
    fill: theme-color('light');
  }

  .navbar {
    padding: 0;
    background-color: $navbar-color;
    @include media-breakpoint-up($responsive-layout-bp) {
      height: $header-height;
    }

    .helper-menu {
      @include media-breakpoint-down(sm) {
        background-color: gray('800');
        width: 100%;
        justify-content: flex-end;

        .nav-link .btn {
          padding: calc(#{$spacer} / 1.125) calc($spacer / 2);
        }

        .nav-link:focus,
        .btn:focus {
          @include focus-box-shadow($gray-800);
        }
      }

      .responsive-text {
        //  position: relative !important;
        @include media-breakpoint-down($responsive-layout-bp) {
          @include visually-hidden;
        }
      }
    }
  }

  .navbar-nav {
    @include media-breakpoint-up($responsive-layout-bp) {
      padding: 0 $spacer;
    }
    align-items: center;

    .navbar-brand,
    .nav-link {
      transition: $focus-transition;
    }
    .nav-tags {
      color: theme-color-level(light, 3);
      @include media-breakpoint-down(xs) {
        @include visually-hidden;
      }
      .asset-tag {
        @include media-breakpoint-down($responsive-layout-bp) {
          @include visually-hidden;
        }
      }
    }
  }

  .nav-trigger {
    fill: theme-color('light');
    width: $header-height;
    height: $header-height;
    transition: none;
    display: inline-flex;
    flex: 0 0 20px;
    align-items: center;

    svg {
      margin: 0;
    }

    &:hover {
      fill: theme-color('light');
      background-color: theme-color-level(light, 10);
    }

    &.open {
      background-color: gray('800');
    }

    @include media-breakpoint-up($responsive-layout-bp) {
      display: none;
    }
  }

  .dropdown-menu {
    margin-top: 0;

    @include media-breakpoint-only(md) {
      margin-top: 4px;
    }
  }

  .navbar-expand {
    @include media-breakpoint-down(sm) {
      flex-flow: wrap;
    }
    .navbar-nav .nav-link {
      color: color('white') !important;
    }
  }
}

.navbar-brand {
  padding: math.div($spacer, 2);
  height: $header-height;
  line-height: 1;
  &:focus {
    box-shadow:
      inset 0 0 0 3px $navbar-color,
      inset 0 0 0 5px color('white');
    outline: 0;
  }
}
</style>
