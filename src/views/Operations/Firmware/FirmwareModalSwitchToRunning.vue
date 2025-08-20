<template>
  <b-modal
    v-model="visible"
    :ok-title="$t('pageFirmware.modal.switchImages')"
    :cancel-title="$t('global.action.cancel')"
    :title="$t('pageFirmware.modal.switchRunningImage')"
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageFirmware.modal.switchRunningImageInfo') }}
    </p>
    <p class="m-0">
      {{
        $t('pageFirmware.modal.switchRunningImageInfo2', {
          backup,
        })
      }}
    </p>
  </b-modal>
</template>

<script>
import { useI18n } from 'vue-i18n';
export default {
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    backup: {
      type: String,
      required: true,
    },
  },
  emits: ['ok', 'update:modelValue'],
  data() {
    return {
      $t: useI18n().t,
      visible: this.modelValue,
    };
  },
  watch: {
    modelValue(newVal) {
      this.visible = newVal;
    },
    visible(newVal) {
      this.$emit('update:modelValue', newVal);
    },
  },
};
</script>
