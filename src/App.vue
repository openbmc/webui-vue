<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { computed, watch, onMounted } from 'vue';
// import { useStore } from './store/index';
import { useStore } from 'vuex';

// import { useRoute } from 'vue-router';
import { useRoute } from './utils/index';

export default {
  name: 'App',
  setup() {
    // Access the store and route
    const route = useRoute();
    const store = useStore();

    // Define a computed property for assetTag
    const assetTag = computed(() => store.getters['global/assetTag']);

    // Watch for changes in assetTag and route.meta.title
    watch([assetTag, () => route.meta.title], ([tag, title]) => {
      if (tag) {
        document.title = `${tag} - ${title || 'Page is missing title'}`;
      }
    });

    onMounted(() => {
      // Initialize the document title
      document.title = `${assetTag.value} - ${
        route.meta.title || 'Page is missing title'
      }`;
    });

    return {
      assetTag,
    };
  },
};
</script>

<style lang="scss">
@import '@/assets/styles/_obmc-custom';
</style>
