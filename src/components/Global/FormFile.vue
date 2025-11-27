<template>
  <div class="custom-form-file-container">
    <b-form-file
      :id="id"
      ref="fileInput"
      v-model="file"
      :accept="accept"
      :disabled="disabled"
      :state="state"
      plain
      @input="$emit('update:modelValue', $event)"
    >
    </b-form-file>
    <button
      type="button"
      class="add-file-btn btn mt-2"
      :class="{
        disabled,
        'btn-secondary': isSecondary,
        'btn-primary': !isSecondary,
      }"
      :disabled="disabled"
      @click="openFilePicker"
    >
      {{ $t('global.fileUpload.browseText') }}
    </button>
    <slot name="invalid"></slot>
    <div v-if="file" class="clear-selected-file px-3 py-2 mt-2">
      {{ file ? file.name : '' }}
      <b-button
        variant="light"
        class="px-2 ms-auto"
        :disabled="disabled"
        @click="file = null"
        ><icon-close :title="$t('global.fileUpload.clearSelectedFile')" /><span
          class="visually-hidden-focusable"
          >{{ $t('global.fileUpload.clearSelectedFile') }}</span
        >
      </b-button>
    </div>
  </div>
</template>

<script>
import { BFormFile } from 'bootstrap-vue-next';
import IconClose from '@carbon/icons-vue/es/close/20';
import { useI18n } from 'vue-i18n';

export default {
  name: 'FormFile',
  components: { BFormFile, IconClose },
  props: {
    id: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    accept: {
      type: String,
      default: '',
    },
    state: {
      type: Boolean,
      default: true,
    },
    variant: {
      type: String,
      default: 'secondary',
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      $t: useI18n().t,
      file: null,
    };
  },
  computed: {
    isSecondary() {
      return this.variant === 'secondary';
    },
  },
  methods: {
    openFilePicker() {
      // Access the native input element within the BFormFile component
      const fileInput = document.getElementById(this.id);
      if (fileInput) {
        fileInput.click();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// Hide the native file input but keep it accessible
:deep(.form-control),
:deep(input[type='file']) {
  opacity: 0;
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.add-file-btn {
  &.disabled {
    border-color: $gray-400;
    background-color: $gray-400;
    color: $gray-600;
    box-shadow: none !important;
  }
  &:focus {
    box-shadow:
      inset 0 0 0 3px theme-color('primary'),
      inset 0 0 0 5px $white;
  }
}

.clear-selected-file {
  display: flex;
  align-items: center;
  background-color: theme-color('light');
  word-break: break-all;
  .btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;

    &:focus {
      box-shadow: inset 0 0 0 2px theme-color('primary');
    }
  }
}
</style>
