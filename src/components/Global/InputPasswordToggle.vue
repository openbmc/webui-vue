<template>
  <div class="input-password-toggle-container">
    <slot></slot>
    <b-button
      aria-hidden="true"
      variant="link"
      :class="{ isVisible: isVisible }"
      @click="toggleVisibility"
    >
      <icon-view-off v-if="isVisible" />
      <icon-view v-else />
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

.btn {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
