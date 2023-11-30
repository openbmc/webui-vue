<template>
  <main id="main-content" class="page-container">
    <slot />
  </main>
</template>

<style lang="scss" scoped>
@import '../node_modules/bootstrap/scss/functions';
@import '../node_modules/bootstrap/scss/variables';
@import '../node_modules/bootstrap/scss/mixins';
main {
  width: 100%;
  height: 100%;
  padding-top: $spacer * 1.5;
  padding-bottom: $spacer * 3;
  padding-left: $spacer;
  padding-right: $spacer;

  &:focus-visible {
    box-shadow: inset 0 0 0 2px theme-color('primary');
    outline: none;
  }

  // @include media-breakpoint-up($responsive-layout-bp) {
  padding-left: $spacer * 2;
  // }
}
</style>
