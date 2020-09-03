<template>
  <b-form-file
    :id="id"
    :value="file"
    placeholder=""
    :browse-text="$t('global.fileUpload.browseText')"
    :disabled="disabled"
  ></b-form-file>
</template>

<script>
import { BFormFile } from 'bootstrap-vue';
export default {
  name: 'FormFile',
  components: {
    BFormFile: BFormFile
  },
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
