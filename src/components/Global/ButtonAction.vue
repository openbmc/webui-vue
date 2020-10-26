<template>
  <b-button
    :variant="variant"
    :aria-label="title"
    :title="title"
    :size="size"
    @click="$emit('click')"
  >
    <slot name="icon"> </slot>
    <span v-if="text"> {{ text }}</span>
  </b-button>
</template>

<script>
export default {
  name: 'ButtonAction',
  props: {
    icon: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: null,
    },
    variant: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.btn,
span {
  display: inline-flex;
  align-items: center;
  svg + span {
    margin-left: $spacer / 4;
  }
}
</style>
