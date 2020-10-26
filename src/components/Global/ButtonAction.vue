<template>
  <b-button
    :variant="variant"
    :aria-label="title"
    :title="title"
    :to="to"
    :size="size"
    @click="$emit('click:button-action')"
  >
    <template v-for="(btnAction, index) in buttonActions">
      <span v-if="btnAction.id === icon" :key="index">
        <component :is="btnAction.icon" :aria-hidden="ariaHiddenIcon" />
        <span v-if="text"> {{ text }}</span>
      </span>
    </template>
    <span v-if="!icon">{{ text }}</span>
  </b-button>
</template>

<script>
import ButtonActionMixin from '@/components/Mixins/ButtonActionMixin';

export default {
  name: 'ButtonAction',
  mixins: [ButtonActionMixin],
  props: {
    ariaHiddenIcon: {
      type: Boolean,
      default: true
    },
    icon: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: null
    },
    to: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: ''
    }
  }
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
