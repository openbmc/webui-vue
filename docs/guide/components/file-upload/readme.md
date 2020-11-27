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

## Example of form file

```vue
<form-file
  id="image-file"
  accept=".tar"
  >
</form-file>
```

![Formfile example in firmware](./formfile.png)
