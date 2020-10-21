<template>
  <div class="page-section">
    <h2 v-if="sectionTitle">{{ sectionTitle }}</h2>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'PageSection',
  props: {
    sectionTitle: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.page-section {
  margin-bottom: $spacer * 4;
}

h2 {
  @include font-size($h3-font-size);
  margin-bottom: $spacer;
}
</style>
