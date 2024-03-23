<template>
  <div class="page-title">
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
  </div>
</template>

<script>
//import i18n from '@/i18n';
export default {
  name: 'PageTitle',
  props: {
    description: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      title: this.$route.meta.title,
    };
  },
  created() {
    let title = this.$route.name;
    let i = 1;
    if (title) {
      while (i < this.$route.name.split('-').length) {
        let index = title.search('-');
        title = title.replace(
          '-' + title.charAt(index + 1),
          title.charAt(index + 1).toUpperCase(),
        );
        i++;
      }
      //this.title = i18n.t('appPageTitle.' + title);
      //document.title = this.title;
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/bmc/helpers/_index.scss';
@import '@/assets/styles/bootstrap/_helpers.scss';

.page-title {
  margin-bottom: $spacer * 2;
}
p {
  max-width: 72ch;
}
</style>
