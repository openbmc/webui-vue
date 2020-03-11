<template>
  <span :class="['status-indicator', status]">
    <slot />
  </span>
</template>

<script>
export default {
  name: 'StatusIndicator',
  props: {
    status: {
      type: String,
      default: 'secondary'
    }
  }
};
</script>

<style lang="scss" scoped>
.status-indicator {
  &::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  &.success::before {
    background-color: theme-color(success);
  }
  &.danger::before {
    background-color: theme-color(danger);
  }
  &.secondary::before {
    background-color: gray(gray-600);
  }
  &.warning::before {
    background-color: theme-color(warning);
  }
}
</style>
