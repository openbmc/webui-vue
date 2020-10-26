<template>
  <div class="btn-icon">
    <icon-add v-if="icon === 'add'" />
    <icon-chevron v-if="icon === 'chevron'" />
    <icon-edit v-if="icon === 'edit'" />
    <icon-filter v-if="icon === 'filter'" />
    <icon-launch v-if="icon === 'launch'" />
    <icon-replace v-if="icon === 'replace'" />
    <icon-settings v-if="icon === 'settings'" />
    <icon-trashcan v-if="icon === 'delete'" />
    <span v-if="buttonText"> {{ buttonText }}</span>
    <!-- buttonTextSr is used for screenreader only text-->
    <span v-if="buttonTextSr" class="sr-only"> {{ buttonTextSr }}</span>
  </div>
</template>

<script>
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconChevron from '@carbon/icons-vue/es/chevron--up/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconFilter from '@carbon/icons-vue/es/settings--adjust/20';
import IconLaunch from '@carbon/icons-vue/es/launch/20';
import IconReplace from '@carbon/icons-vue/es/renew/20';
import IconSettings from '@carbon/icons-vue/es/settings/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';

export default {
  name: 'ButtonContent',
  components: {
    IconAdd,
    IconChevron,
    IconEdit,
    IconFilter,
    IconLaunch,
    IconReplace,
    IconSettings,
    IconTrashcan
  },
  props: {
    buttonTextSr: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    }
  }
};
</script>

<style lang="scss" scoped>
.btn-icon {
  display: inline-flex;
  align-items: center;
}
// Buttons with SVGs and text expect
// text to be wrapped in a span element
svg + span {
  margin-left: $spacer / 4;
}
</style>
