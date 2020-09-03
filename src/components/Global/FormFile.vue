<template>
  <div class="custom-form-file-container">
    <b-form-file
      :id="id"
      v-model="file"
      :accept="accept"
      :disabled="disabled"
      :state="state"
      plain
    >
    </b-form-file>
    <b-button variant="primary" class="add-file-btn">
      {{ $t('global.fileUpload.browseText') }}
    </b-button>
    <div v-if="file" class="clear-selected-file px-3 py-2 mt-2">
      {{ file ? file.name : '' }}
      <b-button
        variant="light"
        class="px-2 ml-auto"
        :aria-label="$t('global.fileUpload.clearSelectedFile')"
        @click="file = null"
        ><icon-close :title="$t('global.fileUpload.clearSelectedFile')"
      /></b-button>
    </div>
    <slot name="invalid"></slot>
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
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    accept: {
      type: String,
      default: ''
    },
    state: {
      type: Boolean,
      default: null
    }
  },
  data() {
    return {
      file: null
    };
  }
};
</script>

<style lang="scss" scoped>
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
.add-file-btn {
  position: absolute;
  top: 0;
  padding: 0.438rem 1rem;
}
</style>
