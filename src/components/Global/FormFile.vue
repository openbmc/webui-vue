<template>
  <div class="custom-form-file-container">
    <b-form-file
      :id="id"
      v-model="file"
      placeholder=""
      accept=""
      :browse-text="$t('global.fileUpload.browseText')"
      :disabled="disabled"
    ></b-form-file>
    <b-form-invalid-feedback role="alert">
      <template v-if="!$v.form.file.required">
        {{ $t('global.form.required') }}
      </template>
    </b-form-invalid-feedback>
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
import { required } from 'vuelidate/lib/validators';
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
  background-color: theme-color('$light');
  .btn {
    line-height: 1;
    &:hover,
    &:focus,
    &:active {
      box-shadow: none !important;
      border-color: transparent !important;
      background-color: transparent !important;
    }
  }
}
</style>
