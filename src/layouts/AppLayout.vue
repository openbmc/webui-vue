<template>
  <div class="app-container">
    <app-header
      ref="focusTarget"
      class="app-header"
      :router-key="routerKey"
      @refresh="refreshPage"
    />
    <app-navigation class="app-navigation" />
    <page-container class="app-content">
      <router-view ref="routerView" :key="routerKey" />
    </page-container>
  </div>
</template>

<script setup>
import AppNavigation from "@/components/AppNavigation/AppNavigation.vue";
import PageContainer from "@/components/Global/PageContainer.vue";
import AppHeader from "@/components/AppHeader/AppHeader.vue";
import useJumpLinkComposable from "@/components/Composables/useJumpLinkComposable";
import {ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";

const { setFocus } = useJumpLinkComposable();
const routerKey = ref(0);
const route = useRoute();
const currentRoute = ref(null);
onMounted(() => {
  currentRoute.value = route;
});

watch(
  () => route,
      () => {
        nextTick(() => {
          setFocus(focusTarget.value);
        });
      }
);
const refreshPage = async() => {
  console.log('Refresh called');
  routerKey.value += 1;
};
</script>

<style lang="scss" scoped>
.app-container {
  display: grid;
  grid-template-columns: 100% !important;
  grid-template-rows: auto;
  grid-template-areas:
    "header"
    "content" !important;

  @include media-breakpoint-up($responsive-layout-bp) {
  grid-template-columns: 300px 1fr !important;
  grid-template-areas:
    "header header"
    "navigation content" !important;
  }
}

.app-header {
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: $zindex-fixed + 1;
}

.app-navigation {
  grid-area: navigation;
}

.app-content {
  grid-area: content;
  background-color: $white;
}
</style>
