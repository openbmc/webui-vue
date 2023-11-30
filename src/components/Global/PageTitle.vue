<template>
  <div class="page-title">
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
  </div>
</template>

<script setup>
import i18n from '@/i18n';
import { reactive } from 'vue';
import router from '@/router';

const props = defineProps({
  description: String,
});
// let title = reactive(router.currentRoute.value.meta.title);
let title = reactive(router.currentRoute.value.name);
let i = 1;
if (title) {
  while (i < router.currentRoute.value.name.split('-').length) {
    let index = title.search('-');
    title = title.replace(
      '-' + title.charAt(index + 1),
      title.charAt(index + 1).toUpperCase()
    );
    i++;
  }

  title = i18n.global.t('appPageTitle.'+title);
  document.title = title;
}
</script>

<style lang="scss" scoped>
.page-title {
  margin-bottom: $spacer * 2;
}
p {
  max-width: 72ch;
}
</style>
