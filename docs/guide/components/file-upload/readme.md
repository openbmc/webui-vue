# FileUpload

File upload componenet is used to upload file in the particular format provided or any format file can be uploaded if format not provided.
Its a customized, cross-browser consistent, file input control that supports single file upload.

To use this component:
1. Import it into the single file component (SFC)
2. Add the `<form-file />` tag
3. Add the optional `id` , `disabled`, `accept` and `state` prop as per the requirement.

[Learn more about Bootstrap-vue Form File Input](https://bootstrap-vue.org/docs/components/form-file)

### Optional properties:

- `id`- Used to set the `id` attribute on the rendered content, and used as the base to generate any additional element IDs as needed
- `disabled` - When set to `true`, disables the component's functionality and places it in a disabled state
- `accept` - Value to set on the file input's `accept` attribute
- `state` - Controls the validation state appearance of the component. `true` for valid, `false` for invalid, or `null` for no validation state

## Example of form file in firmware

```vue
<form-file
  id="image-file"
  accept=".tar"
  :disabled="isPageDisabled"
  :state="getValidationState($v.file)"
  aria-describedby="image-file-help-block"
  @input="onFileUpload($event)"
  >
</form-file>
```

![Formfile example in firmware](./formfile.png)

```vue
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
```
