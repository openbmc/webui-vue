<template>
  <div class="custom-form-file-container">
    <b-form-file
      :id="id"
      v-model="file"
      placeholder=""
      :browse-text="$t('global.fileUpload.browseText')"
      :disabled="disabled"
    ></b-form-file>
    <div v-if="file" class="clear-selected-file bg-light px-3 py-2 mt-2">
      {{ file ? file.name : '' }}
      <b-button variant="light" class="p-0 pl-4 ml-auto" @click="file = null"
        ><icon-close
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
      default: ''
    },
    browseText: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      file: null
    };
  }
};
</script>
