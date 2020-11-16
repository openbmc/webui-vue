<template>
  <!-- Back to top button should be used on pages longer than 3 screens  -->
  <b-button
    v-if="showButton"
    id="scrollToTopBtn"
    class="btn btn-dark btn-top"
    title="Scroll to top"
    aria-label="Scroll to top"
    @click="scrollToTop"
  >
    <icon-up-to-top />
  </b-button>
</template>

<script>
import UpToTop32 from '@carbon/icons-vue/es/up-to-top/32';

export default {
  name: 'BackToTop',
  components: { IconUpToTop: UpToTop32 },
  data() {
    return {
      showButton: false,
    };
  },
  created() {
    window.addEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll() {
      document.documentElement.scrollTop > 1500
        ? (this.showButton = true)
        : (this.showButton = false);
    },
    scrollToTop() {
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.btn-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1001;
}
</style>
