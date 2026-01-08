<template>
  <main id="main-content" class="page-container">
    <slot />
  </main>
</template>

<script>
import JumpLinkMixin from '@/components/Mixins/JumpLinkMixin';
import eventBus from '@/eventBus';

export default {
  name: 'PageContainer',
  mixins: [JumpLinkMixin],
  created() {
    eventBus.$on('skip-navigation', this.handleSkipNavigation);
  },
  beforeUnmount() {
    eventBus.$off('skip-navigation', this.handleSkipNavigation);
  },
  methods: {
    handleSkipNavigation() {
      this.setFocus(this.$el);
    },
  },
};
</script>
<style lang="scss" scoped>
main {
  width: 100%;
  height: 100%;
  padding-top: $spacer * 1.5;
  padding-bottom: $spacer * 3;
  padding-inline-start: $spacer;
  padding-inline-end: $spacer;

  &:focus-visible {
    box-shadow: inset 0 0 0 2px theme-color('primary');
    outline: none;
  }

  @include media-breakpoint-up($responsive-layout-bp) {
    padding-inline-start: $spacer * 2;
  }
}
</style>
