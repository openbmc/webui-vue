# Page Section
The page section component is used to separate each section of page content. It has a prop for a `section-title`. The generated markup will wrap the section in a `<div>` element that populates an `h2` element and renders any content contained in the body of the component.

<bmc-page-section></bmc-page-section>

## Component Example
```vue
<page-section section-title="Section Title">
<dl>
    <dt>Firmware version</dt>
    <dd>xx.xxx.xxx</dd>
</dl>
</page-section>
```

## Rendered Output
```html
<div class="page-section">
    <h2 data-v-00febdfa="">Section Title</h2>
    <dl data-v-00febdfa="">
        <dt data-v-00febdfa="">Firmware version</dt>
        <dd data-v-00febdfa="">xx.xxx.xxx</dd>
    </dl>
</div>
```