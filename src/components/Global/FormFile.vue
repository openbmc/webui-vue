<template>
  <div class="custom-form-file-container">
    <label>
      <b-form-file
        :id="id"
        v-model="file"
        :accept="accept"
        :disabled="disabled"
        :state="state"
        plain
        @input="$emit('input', file)"
      >
      </b-form-file>
      <span class="add-file-btn btn btn-primary">
        {{ $t('global.fileUpload.browseText') }}
      </span>
      <slot name="invalid"></slot>
    </label>
    <div v-if="file" class="clear-selected-file px-3 py-2 mt-2">
      {{ file ? file.name : '' }}
      <b-button variant="light" class="px-2 ml-auto" @click="file = null"
        ><icon-close :title="$t('global.fileUpload.clearSelectedFile')"
      /></b-button>
    </div>
  </div>
</template>

<script>
import { BFormFile } from 'bootstrap-vue';
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
  },
  data() {
    return {
      file: null,
    };
  },
};
</script>

<style lang="scss" scoped>
.form-control-file {
  opacity: 0;
  height: 0;
  &:focus + span {
    box-shadow: inset 0 0 0 3px theme-color('primary'), inset 0 0 0 5px $white;
  }
}

// Get mouse pointer on complete element
.add-file-btn {
  position: relative;
}

.clear-selected-file {
  display: flex;
  align-items: center;
  background-color: theme-color('light');
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
