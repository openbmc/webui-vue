<template>
  <div class="app-container">
    <app-navigation class="app-navigation" />
    <page-container class="app-content">
      <router-view ref="routerView" :key="routerKey" />
    </page-container>
  </div>
</template>

<script>
import AppNavigation from '@/components/AppNavigation/AppNavigation.vue';
import PageContainer from '@/components/Global/PageContainer.vue'
import JumpLinkMixin from '@/components/Mixins/JumpLinkMixin'
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
export default {
  name: 'App',
  components: {
    AppNavigation,
    PageContainer
  },
  mixins: [JumpLinkMixin],
  setup() {
    const routerKey = ref(0)
    const route = useRoute()
    watch(route, () => {
      this.$nextTick(function () {
        this.setFocus(this.$refs.focusTarget.$el)
      })
    })
    const currentRoute = ref(null)
    onMounted(() => {
      currentRoute.value = route
    })
    return {
      routerKey
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../node_modules/bootstrap/scss/functions';
@import '../node_modules/bootstrap/scss/variables';
@import '../node_modules/bootstrap/scss/mixins';
.app-container {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto;
  grid-template-areas:
    'header'
    'content';

  // @include media-breakpoint-up($responsive-layout-bp) {
    grid-template-columns: 300px 1fr;
    grid-template-areas:
      'header header'
      'navigation content';
  // }
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
