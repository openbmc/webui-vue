<template>
  <div class="app-container">
    <app-header ref="focusTarget" class="app-header" @refresh="refresh" />
    <app-navigation class="app-navigation" />
    <page-container class="app-content">
      <router-view ref="routerView" :key="routerKey" />
      <!-- Scroll to top button -->
      <button-back-to-top />
    </page-container>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader';
import AppNavigation from '@/components/AppNavigation';
import PageContainer from '@/components/Global/PageContainer';
import ButtonBackToTop from '@/components/Global/ButtonBackToTop';
import JumpLinkMixin from '@/components/Mixins/JumpLinkMixin';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppNavigation,
    PageContainer,
    ButtonBackToTop,
  },
  mixins: [JumpLinkMixin],
  data() {
    return {
      routerKey: 0,
    };
  },
  watch: {
    $route: function () {
      this.$nextTick(function () {
        this.setFocus(this.$refs.focusTarget.$el);
      });
    },
  },
  mounted() {
    this.$root.$on('refresh-application', () => this.refresh());
  },
  methods: {
    refresh() {
      // Changing the component :key value will trigger
      // a component re-rendering and 'refresh' the view
      this.routerKey += 1;
    },
  },
};
</script>

<style lang="scss" scoped>
.app-container {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto;
  grid-template-areas:
    'header'
    'content';

  @include media-breakpoint-up($responsive-layout-bp) {
    grid-template-columns: $navigation-width 1fr;
    grid-template-areas:
      'header header'
      'navigation content';
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
