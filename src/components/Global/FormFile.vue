<template>
  <div class="custom-form-file-container">
    <b-form-file
      :id="id"
      v-model="file"
      :accept="accept"
      :browse-text="$t('global.fileUpload.browseText')"
      :disabled="disabled"
      :state="getValidationState($v.form.file)"
    >
    </b-form-file>
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
import { required } from 'vuelidate/lib/validators';
import IconClose from '@carbon/icons-vue/es/close/20';

import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  name: 'FormFile',
  components: { BFormFile, IconClose },
  mixins: [VuelidateMixin],
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
    }
  },
  data() {
    return {
      file: null
    };
  },
  validations() {
    return {
      form: {
        file: {
          required
        }
      }
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
</style>
