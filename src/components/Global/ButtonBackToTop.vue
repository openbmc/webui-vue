<template>
  <b-button
    id="scrollToTopBtn"
    class="btn-top btn-icon-only"
    :class="{ showBtn: showButton }"
    variant="secondary"
    :title="$t('global.ariaLabel.scrollToTop')"
    :aria-label="$t('global.ariaLabel.scrollToTop')"
    @click="scrollToTop"
  >
    <icon-up-to-top />
  </b-button>
</template>

<script>
import UpToTop24 from '@carbon/icons-vue/es/up-to-top/24';

import { debounce } from 'lodash';

export default {
  name: 'BackToTop',
  components: { IconUpToTop: UpToTop24 },
  data() {
    return {
      showButton: false,
    };
  },
  created() {
    window.addEventListener('scroll', debounce(this.handleScroll, 200));
  },
  methods: {
    handleScroll() {
      document.documentElement.scrollTop > 500
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
  z-index: $zindex-fixed;
  box-shadow: $box-shadow;
  opacity: 0;
  transition: $transition-base;
  @media (min-width: 1600px) {
    left: 1485px;
    right: auto;
  }
}
.showBtn {
  opacity: 1;
}
</style>
