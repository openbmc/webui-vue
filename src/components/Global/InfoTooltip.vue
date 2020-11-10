<template>
  <b-button
    v-b-tooltip
    variant="link"
    class="btn-tooltip btn-icon-only"
    :title="title"
    :aria-label="$t('global.ariaLabel.tooltip')"
  >
    <icon-tooltip />
  </b-button>
</template>

<script>
import IconTooltip from '@carbon/icons-vue/es/information/16';

export default {
  components: { IconTooltip },
  props: {
    title: {
      type: String,
      default: '',
    },
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
