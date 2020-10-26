<template>
  <b-button
    :variant="variant"
    :aria-label="title"
    :title="title"
    :to="to"
    :size="size"
    @click="$emit('click')"
  >
    <slot />
  </b-button>
</template>

<script>
export default {
  name: 'ButtonAction',
  props: {
    size: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: null,
    },
    to: {
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
