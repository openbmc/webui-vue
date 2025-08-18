<template>
  <div>
    <div class="nav-container" :class="{ open: isNavigationOpen }">
      <nav ref="nav" :aria-label="$t('appNavigation.primaryNavigation')">
        <b-nav vertical class="mb-4">
          <template v-for="navItem in navigationItems">
            <!-- Navigation items with no children -->
            <li
              v-if="!navItem.children"
              :key="`nav-${navItem.index}`"
              class="nav-item"
            >
              <router-link
                :to="navItem.route"
                :data-test-id="`nav-item-${navItem.id}`"
                class="nav-link"
              >
                <component :is="navItem.icon" />
                {{ navItem.label }}
              </router-link>
            </li>

            <!-- Navigation items with children -->
            <li v-else :key="`nav-group-${navItem.index}`" class="nav-item">
              <b-button
                :class="{ collapsed: !isItemOpen(navItem.id) }"
                variant="link"
                :data-test-id="`nav-button-${navItem.id}`"
                :aria-controls="navItem.id"
                :aria-expanded="isItemOpen(navItem.id) ? 'true' : 'false'"
                @click="toggleCollapse(navItem.id)"
              >
                <component :is="navItem.icon" />
                {{ navItem.label }}
                <icon-expand class="icon-expand" />
              </b-button>
              <b-collapse
                :id="navItem.id"
                v-model="openSections[navItem.id]"
                tag="ul"
                class="nav-item__nav"
              >
                <li
                  v-for="(subNavItem, i) in filteredNavItem(navItem.children)"
                  :key="i"
                  class="nav-item"
                >
                  <router-link
                    :to="subNavItem.route"
                    :data-test-id="`nav-item-${subNavItem.id}`"
                    class="nav-link"
                  >
                    {{ subNavItem.label }}
                  </router-link>
                </li>
              </b-collapse>
            </li>
          </template>
        </b-nav>
      </nav>
    </div>
    <transition name="fade">
      <div
        v-if="isNavigationOpen"
        id="nav-overlay"
        class="nav-overlay"
        @click="toggleIsOpen"
      ></div>
    </transition>
  </div>
</template>

<script>
//Do not change Mixin import.
//Exact match alias set to support
//dotenv customizations.
import AppNavigationMixin from './AppNavigationMixin';

export default {
  name: 'AppNavigation',
  mixins: [AppNavigationMixin],
  data() {
    return {
      isNavigationOpen: false,
      currentUserRole: null,
      openSections: {},
    };
  },
  watch: {
    $route: function () {
      this.isNavigationOpen = false;
      // Ensure the parent section of the current route is expanded
      this.initializeOpenSectionsFromRoute();
    },
    isNavigationOpen: function (isNavigationOpen) {
      require('@/eventBus').default.$emit(
        'change-is-navigation-open',
        isNavigationOpen,
      );
    },
  },
  mounted() {
    this.getPrivilege();
    require('@/eventBus').default.$on('toggle-navigation', () =>
      this.toggleIsOpen(),
    );
    // Expand the parent section for the current route on initial load/refresh
    this.initializeOpenSectionsFromRoute();
  },
  beforeUnmount() {
    require('@/eventBus').default.$off(
      'toggle-navigation',
      this.handleToggleNavigation,
    );
  },
  methods: {
    isItemOpen(id) {
      return !!this.openSections[id];
    },
    toggleCollapse(id) {
      if (this.$set) {
        this.$set(this.openSections, id, !this.openSections[id]);
      } else {
        this.openSections = {
          ...this.openSections,
          [id]: !this.openSections[id],
        };
      }
    },
    toggleIsOpen() {
      this.isNavigationOpen = !this.isNavigationOpen;
    },
    getPrivilege() {
      this.currentUserRole = this.$store?.getters['global/userPrivilege'];
    },
    filteredNavItem(navItem) {
      if (this.currentUserRole) {
        return navItem.filter(({ exclusiveToRoles }) => {
          if (!exclusiveToRoles?.length) return true;
          return exclusiveToRoles.includes(this.currentUserRole);
        });
      } else return navItem;
    },
    initializeOpenSectionsFromRoute() {
      const currentPath = this.$route?.path;
      if (!currentPath) return;
      const sectionsToOpen = {};
      for (const item of this.navigationItems) {
        if (
          item.children &&
          item.children.some((child) => child.route === currentPath)
        ) {
          sectionsToOpen[item.id] = true;
        }
      }
      this.openSections = { ...this.openSections, ...sectionsToOpen };
    },
  },
};
</script>

<style scoped lang="scss">
svg {
  fill: currentColor;
  height: 1.2rem;
  width: 1.2rem;
  margin-inline-start: 0 !important; //!important overriding button specificity
  vertical-align: text-bottom;
  &:not(.icon-expand) {
    margin-inline-end: $spacer;
  }
}

.nav {
  padding-top: calc(#{$spacer} / 4);
  @include media-breakpoint-up($responsive-layout-bp) {
    padding-top: $spacer;
  }
}

.nav-item__nav {
  list-style: none;
  padding-inline-start: 0;
  margin-inline-start: 0;

  .nav-item {
    outline: none;
    list-style: none;
  }

  .nav-link {
    padding-inline-start: $spacer * 4;
    outline: none;

    &:not(.nav-link--current) {
      font-weight: normal;
    }
  }
}

.btn-link {
  display: inline-block;
  width: 100%;
  text-align: start;
  text-decoration: none !important;
  border-radius: 0;

  &.collapsed {
    .icon-expand {
      transform: rotate(180deg);
    }
  }
}

.icon-expand {
  float: inline-end;
  margin-top: calc(#{$spacer} / 4);
}

.btn-link,
.nav-link {
  position: relative;
  font-weight: $headings-font-weight;
  padding-inline-start: $spacer; // defining consistent padding for links and buttons
  padding-inline-end: $spacer;
  color: theme-color('secondary');

  &:hover {
    background-color: theme-color-level(dark, -10.5);
    color: theme-color('dark');
  }

  &:focus {
    background-color: theme-color-level(light, 0);
    box-shadow: inset 0 0 0 2px theme-color('primary');
    color: theme-color('dark');
    outline: 0;
  }

  &:active {
    background-color: theme-color('secondary');
    color: $white;
  }
}

.nav-link--current {
  font-weight: $headings-font-weight;
  background-color: theme-color('secondary');
  color: theme-color('light');
  cursor: default;
  box-shadow: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    inset-inline-start: 0;
    width: 4px;
    background-color: theme-color('primary');
  }

  &:hover,
  &:focus {
    background-color: theme-color('secondary');
    color: theme-color('light');
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
  background-color: theme-color('light');
  transform: translateX(-$navigation-width);
  transition: transform $exit-easing--productive $duration--moderate-02;
  border-inline-end: 1px solid theme-color-level('light', 2.85);

  @include media-breakpoint-down(md) {
    z-index: $zindex-fixed + 2;
  }

  &.open,
  &:focus-within {
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
  z-index: $zindex-fixed + 1;
  background-color: $black;
  opacity: 0.5;

  &.fade-enter-active {
    transition: opacity $duration--moderate-02 $entrance-easing--productive;
  }

  &.fade-leave-active {
    transition: opacity $duration--fast-02 $exit-easing--productive;
  }

  &.fade-enter, // Remove this vue2 based only class when switching to vue3
  &.fade-enter-from, // This is vue3 based only class modified from 'fade-enter'
  &.fade-leave-to {
    opacity: 0;
  }

  @include media-breakpoint-up($responsive-layout-bp) {
    display: none;
  }
}
</style>
