<template>
  <b-button
    :aria-label="title"
    :title="title"
    variant="link"
    :disabled="!enabled"
    @click="$emit('click:tableAction', value)"
  >
    <slot name="icon">
      {{ title }}
    </slot>
  </b-button>
</template>

<script>
export default {
  name: 'TableRowAction',
  props: {
    value: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: null
    }
  }
};
</script>

<style lang="scss" scoped>
.btn.btn-link {
  padding: $spacer / 2;
}
</style>
