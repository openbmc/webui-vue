<template>
  <div class="app-container">
    <page-container class="app-content">
      <router-view />
    </page-container>
  </div>
</template>

<script>
import PageContainer from '@/components/Global/PageContainer';
export default {
  name: 'Console',
  components: {
    PageContainer
  }
};
</script>

<style lang="scss" scoped>
@import 'src/assets/styles/helpers';

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

.app-content {
  grid-area: content;
  background-color: $white;
  position: absolute;
  padding: 100px;
}
</style>
