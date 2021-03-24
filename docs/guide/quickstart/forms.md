# Forms

Forms are created using the [bootstrap-vue form
component](https://bootstrap-vue.org/docs/components/form)
and validated with the [Vuelidate](https://vuelidate.js.org/#sub-installation)
plugin.

## Form component

When creating a new form, use the `<b-form>` [form
component](https://bootstrap-vue.org/docs/components/form). Use the `.prevent`
event modifier on submit to prevent the submit event from reloading the page.

## Form group component

The `<b-form-group>` [form group
component](https://bootstrap-vue.org/docs/components/form-group)
pairs form controls with a legend or label, helper text, invalid/valid
feedback text, and visual validation state feedback. Learn more about
commonly used form components:

- [Form checkbox](https://bootstrap-vue.org/docs/components/form-checkbox)
- [Form input](https://bootstrap-vue.org/docs/components/form-input)
- [Form radio](https://bootstrap-vue.org/docs/components/form-radio)
- [Form select](https://bootstrap-vue.org/docs/components/form-select)
- [Form file custom component](/guide/components/file-upload)

When helper text is provided, use the `<b-form-text>` component and `aria-describedby` on the
form group component the helper text describes.

## Validation

For custom form validation messages, disable browser native HTML5
validation by setting the `novalidate` prop on `<b-form>`. Use Vuelidate to
check the form validation state and add
custom validation messages in the `<b-form-invalid-feedback>` component.

When creating a new form add the `VuelidateMixin`
to the `scripts` block and import any
[validators](https://vuelidate.js.org/#validators) needed
such as: `required`, `requiredIf`, etc. The use of built-in validators is
preferred.

## Complete form

A complete form will look like this.

```vue
<template>
  <b-form novalidate @submit.prevent="handleSubmit">
    <b-form-group
      :label="$t('pageName.form.inputLabel')"
      label-for="form-input-id"
    >
      <b-form-text id="form-input-helper-text">
        {{ $t('pageName.form.helperText') }}
      </b-form-text>
      <b-form-input
        id="form-input-id"
        v-model="form.input"
        type="text"
        aria-describedby="form-input-helper-text"
        :state="getValidationState($v.form.input)"
        @change="$v.form.input.$touch()"
      />
      <b-form-invalid-feedback role="alert">
        <div v-if="!$v.form.input.required">
          {{ $t('global.form.fieldRequired') }}
        </div>
      </b-form-invalid-feedback>
    </b-form-group>
    <b-button variant="primary" type="submit" class="mb-3">
      {{ $t('global.action.save') }}
    </b-button>
  </b-form>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import { required } from 'vuelidate/lib/validators';

export default {
  name: 'PageName',
  components: {
  ...
  },
  mixins: [VuelidateMixin],
  data(){
    form: {
      input: '',
    }
  },
  validations() {
    return {
      form: {
        input: { required },
      }
    }
  },
  computed: {
    ...
  },
  created() {
    ...
  },
  methods:{
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$store
        .dispatch(
          'pageName/updateFormData',
          formData
        )
        .then((success) => {
          this.successToast(success);
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.form.$reset();
          this.endLoader();
        });
    },
};
</script>
```
