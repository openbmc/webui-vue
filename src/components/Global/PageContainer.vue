<template>
  <main id="main-content">
    <slot />
  </main>
</template>

<script>
export default {
  name: 'PageContainer'
};
</script>

<style lang="scss" scoped>
main {
  padding-top: $spacer * 1.5;
  padding-bottom: $spacer * 3;
  padding-left: $spacer * 2;
  padding-right: $spacer;
  background-color: $gray-100;
  height: 100%;
  min-height: calc(100vh - 60px /*header height*/);
}
</style>
