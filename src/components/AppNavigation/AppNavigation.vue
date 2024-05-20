<template>
  <div>
    <div class="nav-container" :class="{ open: isNavigationOpen }">
      <Nav ref="nav" :aria-label="t('appNavigation.primaryNavigation')">
        <BNav vertical class="mb-4">
          <template v-for="(navItem, index) in navigationItems">
            <!-- Navigation items with no children -->
            <BNavItem
              v-if="!navItem.children"
              :key="index"
              :to="navItem.route"
              :data-test-id="`nav-item-${navItem.id}`"
              class="nav-nochild"
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
                <Icon-Chevron-Up class="icon-expand" />
              </BButton>
              <BCollapse
                :id="navItem.id"
                class="nav-item__nav"
              >
                <li class="">
                  <router-link
                    v-for="(subNavItem, i) of filteredNavItem(navItem.children)"
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
      </Nav>
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

<script setup>
import { ref, watch, provide, inject } from 'vue';
import { AppNavigationData } from './AppNavigationData';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import GlobalStore from '../../store/modules/GlobalStore';
import IconChevronUp from '@carbon/icons-vue/es/chevron--up/16';
import eventBus from '@/eventBus';

const globalStore = GlobalStore();
const { navigationItems } = AppNavigationData();
const { t } = useI18n();
let isNavigationOpen = ref(false);
const route = useRoute();
let currentUserRole = ref(null);
onMounted(() => {
  currentUserRole = globalStore.userPrivilege;
  eventBus.on('toggle-navigation', toggleIsOpen)
});
// provide('isNavigationOpen', isNavigationOpen);
watch(route, () => {
  isNavigationOpen = false;
});
watch(isNavigationOpen, () => {
  eventBus.emit('change-is-navigation-open',  () => { isNavigationOpen });
});
const toggleIsOpen = (() => {
  isNavigationOpen.value = !isNavigationOpen.value;
  eventBus.emit('change-is-navigation-open', () => { isNavigationOpen.value });
});
// provide('toggle-navigation', toggleIsOpen);

const filteredNavItem = (navItem) => {
  if (currentUserRole) {
    return navItem.filter(({ exclusiveToRoles }) => {
      if (!exclusiveToRoles?.length) return true;
      return exclusiveToRoles.includes(currentUserRole);
    });
  } else return navItem;
};
</script>

<style scoped lang="scss">
// @import '../node_modules/bootstrap/scss/functions';
// @import '../node_modules/bootstrap/scss/variables';
// @import '../node_modules/bootstrap/scss/mixins';
// @import '../../assets/styles/bmc/helpers/functions';
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
.pad-left {
  padding-left: 0;
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
  color: #3f3f3f;

  &:hover {
    background-color: #dadada;;
    color: #161616;
  }

  &:focus {
    background-color: #f4f4f4;
    box-shadow: inset 0 0 0 2px #0068b5;
    color: #161616;
    outline: 0;
  }

  &:active {
    background-color: #3f3f3f;
    color: $white;
  }
}
.nav-nochild {
  color: #3f3f3f !important;
  &:hover {
    background-color: #dadada;;
    color: #161616;
  }

  &:focus {
    background-color: #f4f4f4;
    box-shadow: inset 0 0 0 2px #0068b5;
    color: #161616;
    outline: 0;
  }
  &:active {
    background-color: #3f3f3f !important;
    color: $white !important;
  }
}

.nav-link--current {
  font-weight: $headings-font-weight;
  background-color: #3f3f3f;
  color: #f4f4f4;
  cursor: default;
  box-shadow: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background-color: #0068b5;
  }

  &:hover,
  &:focus {
    background-color: #3f3f3f;
    color: #f4f4f4;
  }
}
.nav-items--current {
  font-weight: $headings-font-weight;
  background-color: #3f3f3f;
  color: #f4f4f4;
  cursor: default;
  box-shadow: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background-color: #0068b5;
  }

  &:hover,
  &:focus {
    background-color: #3f3f3f;
    color: #f4f4f4;
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
  background-color: #f4f4f4;
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

   @include media-breakpoint-up($responsive-layout-bp) {
      transition-duration: 70ms;
      transform: translateX(0);
  }
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

  &.fade-enter-from, // This is vue3 based only class modified from 'fade-enter'
  &.fade-leave-to {
    opacity: 0;
  }

  @include media-breakpoint-up($responsive-layout-bp) {
  display: none;
  }
}
</style>
