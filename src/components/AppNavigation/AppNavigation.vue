<template>
  <div>
    <div class="nav-container" :class="{ open: isNavigationOpen }">
      <nav ref="nav" :aria-label="$t('appNavigation.primaryNavigation')">
        <b-nav vertical class="mb-4">
          <template v-for="(navItem, index) in navigationItems">
            <!-- Navigation items with no children -->
            <b-nav-item
              v-if="!navItem.children"
              :key="index"
              :to="navItem.route"
              :data-test-id="`nav-item-${navItem.id}`"
            >
              <component :is="navItem.icon" />
              {{ navItem.label }}
            </b-nav-item>

            <!-- Navigation items with children -->
            <li v-else :key="index" class="nav-item">
              <b-button
                v-b-toggle="`${navItem.id}`"
                variant="link"
                :data-test-id="`nav-button-${navItem.id}`"
              >
                <component :is="navItem.icon" />
                {{ navItem.label }}
                <icon-expand class="icon-expand" />
              </b-button>
              <b-collapse :id="navItem.id" tag="ul" class="nav-item__nav">
                <b-nav-item
                  v-for="(subNavItem, i) of navItem.children"
                  :key="i"
                  :to="subNavItem.route"
                  :data-test-id="`nav-item-${subNavItem.id}`"
                >
                  {{ subNavItem.label }}
                </b-nav-item>
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
  fill: currentColor;
  height: 1.2rem;
  width: 1.2rem;
  margin-left: 0 !important; //!important overriding button specificity
  vertical-align: text-bottom;
  &:not(.icon-expand) {
    margin-right: $spacer;
  }
}

.nav {
  padding-top: $spacer / 4;
  @include media-breakpoint-up($responsive-layout-bp) {
    padding-top: $spacer;
  }
}

.nav-item__nav {
  list-style: none;
  padding-left: 0;
  margin-left: 0;

  .nav-item {
    outline: none;
  }

  .nav-link {
    padding-left: $spacer * 4;
    outline: none;

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
  color: theme-color('secondary');

  &:hover {
    background-color: theme-color-level(dark, -10.5);
    color: theme-color('dark');
  }

  &:focus {
    background-color: theme-color-level(light, 0);
    box-shadow: inset 0 0 0 2px theme-color('primary');
    color: theme-color('dark');
  }

  &:active {
    background-color: gray('800');
    color: $white;
  }
}

.btn-link:active,
.nav-link:active,
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
    left: 0;
    width: 4px;
    background-color: theme-color('primary');
  }
}
.nav-link--current {
  &:hover {
    background-color: theme-color('dark');
    color: theme-color('light');
  }
  &:focus {
    box-shadow: inset 0 0 0 2px theme-color('primary');
    outline: 0;
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
  background-color: gray('100');
  transform: translateX(-$navigation-width);
  transition: transform $exit-easing--productive $duration--moderate-02;
  border-right: 1px solid gray('500');
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

  &.fade-enter,
  &.fade-leave-to {
    opacity: 0;
  }

  @include media-breakpoint-up($responsive-layout-bp) {
    display: none;
  }
}
</style>
