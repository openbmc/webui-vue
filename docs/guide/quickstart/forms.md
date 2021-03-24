# Forms

Forms are created using the [bootstrap-vue form
component](https://bootstrap-vue.org/docs/components/form)
and validated with the [Vuelidate](https://vuelidate.js.org/#sub-installation)
plugin.

## Form component

When creating a new form, use the `<b-form>` [form
component](https://bootstrap-vue.org/docs/components/form).

```vue
<b-form novalidate @submit.prevent="handleSubmit">
    <b-form-group>
      // Add form component here
    </b-form-group>
  <b-button variant="primary" type="submit" class="mb-3">
    {{ $t('global.action.save') }}
  </b-button>
</b-form>
```

## Form group component

The `<b-form-group>` [form group
component](https://bootstrap-vue.org/docs/components/form-group)
pairs form controls with a legend or label, helper text and invalid/valid
feedback text, as well as validation state feedback. Learn more about
commonly used form components:

- [Form checkbox](https://bootstrap-vue.org/docs/components/form-checkbox)
- [Form input](https://bootstrap-vue.org/docs/components/form-input)
- [Form radio](https://bootstrap-vue.org/docs/components/form-radio)
- [Form select](https://bootstrap-vue.org/docs/components/form-select)

- [Form file custom component](/guide/components/file-upload)

## Vuelidate

[Vuelidate](https://vuelidate.js.org/#sub-basic-form) is a client side
validation plugin. When creating a new form add the `VuelidateMixin`
to the `scripts` block and import any
[validators](https://vuelidate.js.org/#sub-builtin-validators) needed
such as: `required`, `requiredIf`, etc. Use builtin validators when possible.

## Complete form

A complete form will look like this.

```vue
<template>
  <b-form novalidate @submit.prevent="handleSubmit">
    <b-form-group>
      <b-form-input
        id="form-input"
        v-model="form.input"
        type="text"
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
      // save actions
      this.$store
        .dispatch(
          'pageName/updateData',
          updatedForm
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
