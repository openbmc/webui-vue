<template>
  <div>
    <div class="nav-container" :class="{ open: isNavigationOpen }">
      <nav ref="nav" :aria-label="t('appNavigation.primaryNavigation')">
        <BNav vertical class="mb-4">
          <template v-for="(navItem, index) in navigationItems">
            <!-- Navigation items with no children -->
            <BNavItem
              v-if="!navItem.children"
              :key="index"
              :to="navItem.route"
              :data-test-id="`nav-item-${navItem.id}`"
            >
              <component :is="navItem.icon" />
              {{ navItem.label }}
            </BNavItem>

            <!-- Navigation items with children -->
            <li v-else class="nav-item">
              <BButton
                v-b-toggle="`${navItem.id}`"
                variant="link"
                :data-test-id="`nav-button-${navItem.id}`"
              >
                <component :is="navItem.icon" />
                {{ navItem.label }}
                <icon-expand class="icon-expand" />
              </BButton>
              <BCollapse :id="navItem.id" tag="ul" class="nav-item__nav">
                <li class="nav-item">
                  <router-link
                    v-for="(subNavItem, i) of navItem.children"
                    :key="i"
                    :to="subNavItem.route"
                    :data-test-id="`nav-item-${subNavItem.id}`"
                    class="nav-link"
                  >
                    {{ subNavItem.label }}
                  </router-link>
                </li>
              </BCollapse>
            </li>
          </template>
        </BNav>
      </nav>
    </div>
    <transition name="fade">
      <div v-if="isNavigationOpen" id="nav-overlay" class="nav-overlay" @click="toggleIsOpen"></div>
    </transition>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import AppNavigationMixin from './AppNavigationMixin'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default {
  name: 'AppNavigation',
  mixins: [AppNavigationMixin],
  setup() {
    const { t } = useI18n()
  
    const isNavigationOpen = ref(false)
    const currentUserRole = ref(null)
    const route = useRoute()

    watch(route, () => {
      this.isNavigationOpen = false
    })
    watch(isNavigationOpen, () => {
      this.isNavigationOpen = false
      // this.$root.$emit('change-is-navigation-open', isNavigationOpen)
    })
    // onMounted(() => {
    //   this.$root.$on('toggle-navigation', () => this.toggleIsOpen())
    // })
    return {
      t,
      isNavigationOpen,
      currentUserRole,
    }
  }
}
</script>

<style scoped lang="scss">
@import '../node_modules/bootstrap/scss/functions';
@import '../node_modules/bootstrap/scss/variables';
@import '../node_modules/bootstrap/scss/mixins';
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
  padding-top: 4px;
  // @include media-breakpoint-up($responsive-layout-bp) {
  padding-top: $spacer;
  // }
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
  display: inline-block;
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
  margin-top: 4px;
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
    left: 0;
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
  width: 300px;
  top: 48px;
  bottom: 0;
  left: 0;
  z-index: $zindex-fixed;
  overflow-y: auto;
  background-color: theme-color('light');
  transform: translateX(-300px);
  transition: transform cubic-bezier(0.2, 0, 1, 0.9) 240ms;
  border-right: 1px solid theme-color-level('light', 2.85);

  @include media-breakpoint-down(md) {
    z-index: $zindex-fixed + 2;
  }

  &.open,
  &:focus-within {
    transform: translateX(0);
    transition-timing-function: cubic-bezier(0, 0, 0.38, 0.9);
  }

  // @include media-breakpoint-up($responsive-layout-bp) {
  transition-duration: 70ms;
  transform: translateX(0);
  // }
}

.nav-overlay {
  position: fixed;
  top: 48px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $zindex-fixed + 1;
  background-color: $black;
  opacity: 0.5;

  &.fade-enter-active {
    transition: opacity 240ms cubic-bezier(0, 0, 0.38, 0.9);
  }

  &.fade-leave-active {
    transition: opacity 110ms cubic-bezier(0.2, 0, 1, 0.9);
  }

  &.fade-enter, // Remove this vue2 based only class when switching to vue3
  &.fade-enter-from, // This is vue3 based only class modified from 'fade-enter'
  &.fade-leave-to {
    opacity: 0;
  }

  // @include media-breakpoint-up($responsive-layout-bp) {
  // display: none;
  // }
}
</style>
