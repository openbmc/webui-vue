<template>
  <header class="page-title">
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
  </header>
</template>

<script>
export default {
  name: 'PageTitle',
  props: ['description'],
  data() {
    return {
      title: this.$route.meta.title
    };
  }
};
</script>

<style lang="scss" scoped>
.page-title {
  margin-bottom: $spacer * 2;
}
h1 {
  font-weight: $display4-weight;
  line-height: $display-line-height;
}
p {
  max-width: 72ch;
}
</style>
