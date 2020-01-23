<template>
  <section class="page-section">
    <h2>{{ sectionTitle }}</h2>
    <slot />
  </section>
</template>

<script>
export default {
  name: 'PageSection',
  props: {
    sectionTitle: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.page-section {
  margin-bottom: $spacer * 2;
}
h2 {
  @include font-size($h4-font-size);
  margin-bottom: $spacer;
  &::after {
    content: '';
    display: block;
    width: 100px;
    border: 1px solid $gray-300;
    margin-top: 10px;
  }
}
</style>
