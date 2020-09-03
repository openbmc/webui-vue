<template>
  <div class="custom-form-file-container">
    <b-form-file
      :id="id"
      v-model="file"
      :accept="accept"
      :disabled="disabled"
      :state="state"
    >
    </b-form-file>
    <div class="add-file-btn btn btn-primary btn-sm">
      {{ $t('global.fileUpload.browseText') }}
    </div>
    <div v-if="file" class="clear-selected-file px-3 py-2 mt-2">
      {{ file ? file.name : '' }}
      <b-button variant="light" class="px-2 ml-auto" @click="file = null"
        ><icon-close
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
  padding: 0.375rem 0.75rem;
  position: absolute;
  left: 0;
}
</style>
