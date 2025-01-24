<template>
  <b-button
    v-b-tooltip
    variant="link"
    class="btn-tooltip btn-icon-only"
    :title="title"
  >
    <icon-tooltip />
    <span class="sr-only">{{ $t('global.ariaLabel.tooltip') }}</span>
  </b-button>
</template>

<script>
import IconTooltip from '@carbon/icons-vue/es/information/16';
import { useI18n } from 'vue-i18n';

export default {
  components: { IconTooltip },
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      $t: useI18n().t,
    };
  },
};
</script>

<style lang="scss" scoped>
.btn-tooltip {
  padding: 0;
  line-height: 1em;
  svg {
    vertical-align: baseline;
  }
}
</style>
