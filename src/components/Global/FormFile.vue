<template>
  <div class="custom-form-file-container">
    <b-form-file
      :id="id"
      ref="fileInput"
      :model-value="file"
      :accept="accept"
      :disabled="disabled"
      :state="state"
      plain
      @change="onNativeFileChange"
      @update:model-value="onFileChange"
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
    modelValue: {
      type: [File, Object, null],
      default: null,
    },
  },
  emits: ['update:modelValue', 'input'],
  data() {
    return {
      internalFile: null, // Fallback when parent doesn't use v-model
    };
  },
  computed: {
    file: {
      get() {
        // Use modelValue if provided, otherwise use internal state
        return this.modelValue !== null ? this.modelValue : this.internalFile;
      },
      set(value) {
        this.internalFile = value; // Always update internal state
        this.$emit('update:modelValue', value);
      },
    },
    isSecondary() {
      return this.variant === 'secondary';
    },
  },
  methods: {
    openFilePicker() {
      // Access the native input element within the BFormFile component
      const refInput = this.$refs.fileInput;
      if (refInput) {
        // Try different ways to get the input element
        let input = null;
        if (refInput.$el) {
          // If $el is the input itself
          if (refInput.$el.tagName === 'INPUT') {
            input = refInput.$el;
          } else if (typeof refInput.$el.querySelector === 'function') {
            // If $el is a wrapper, find the input inside
            input = refInput.$el.querySelector('input[type="file"]');
          }
        }
        // Fallback to getElementById
        if (!input && this.id) {
          input = document.getElementById(this.id);
        }
        if (input && typeof input.click === 'function') {
          input.click();
        }
      }
    },
    onFileChange(value) {
      this.internalFile = value;
      this.$emit('update:modelValue', value);
      this.$emit('input', value);
    },
    onNativeFileChange(event) {
      const files = event?.target?.files;
      if (files && files.length > 0) {
        const file = files[0];
        this.internalFile = file;
        this.$emit('update:modelValue', file);
        this.$emit('input', file);
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
