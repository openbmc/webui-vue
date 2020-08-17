<template>
  <div class="input-password-toggle-container">
    <slot></slot>
    <b-button
      :aria-label="$t('global.ariaLabel.showPassword')"
      variant="link"
      class="input-toggle-password-btn"
      :class="{ isVisible: isVisible }"
      @click="toggleVisibility"
    >
      <icon-view-off v-if="isVisible" aria-hidden="true" />
      <icon-view v-else aria-hidden="true" />
    </b-button>
  </div>
</template>

<script>
import IconView from '@carbon/icons-vue/es/view/20';
import IconViewOff from '@carbon/icons-vue/es/view--off/20';

export default {
  name: 'InputPasswordToggle',
  components: { IconView, IconViewOff },
  data() {
    return {
      isVisible: false
    };
  },
  methods: {
    toggleVisibility() {
      const firstChild = this.$children[0];
      const inputEl = firstChild ? firstChild.$el : null;

      this.isVisible = !this.isVisible;

      if (inputEl.nodeName === 'INPUT') {
        inputEl.type = this.isVisible ? 'text' : 'password';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.input-password-toggle-container {
  position: relative;
}
</style>
