<template>
  <b-button
    :variant="variant"
    :aria-label="title"
    :title="title"
    :to="to"
    @click="$emit('click:button-action', value)"
  >
    <icon-add v-if="icon === 'add'" />
    <icon-arrow-down v-if="icon === 'arrow-down'" />
    <icon-chevron v-if="icon === 'chevron'" />
    <icon-edit v-if="icon === 'edit'" />
    <icon-launch v-if="icon === 'launch'" />
    <icon-replace v-if="icon === 'replace'" />
    <icon-settings v-if="icon === 'settings'" />
    <icon-trashcan v-if="icon === 'delete'" />
    <span v-if="text"> {{ text }}</span>
  </b-button>
</template>

<script>
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconArrowDown from '@carbon/icons-vue/es/arrow--down/16';
import IconChevron from '@carbon/icons-vue/es/chevron--up/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconLaunch from '@carbon/icons-vue/es/launch/20';
import IconReplace from '@carbon/icons-vue/es/renew/20';
import IconSettings from '@carbon/icons-vue/es/settings/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';

export default {
  name: 'ButtonAction',
  components: {
    IconAdd,
    IconArrowDown,
    IconChevron,
    IconEdit,
    IconLaunch,
    IconReplace,
    IconSettings,
    IconTrashcan
  },
  props: {
    text: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    variant: {
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
    }
  }
};
</script>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  // Buttons with SVGs and text expect
  // text to be wrapped in a span element
  svg + span {
    margin-left: $spacer / 4;
  }
}
</style>
