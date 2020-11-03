# InfoTooltip

The `InfoTooltip` is a custom component that uses a Bootstrap-vue tooltip with an info icon. This custom component requires a title property containing the tooltip text to display to the user.

[Read more about the Bootstrap-vue tooltip component](https://bootstrap-vue.org/docs/components/tooltip)

## Example

```vue
<info-tooltip
  :title="Title" //should be translated
/>
```

![Tooltip example](/tooltip.png)

```vue
<template>
  <b-button
    v-b-tooltip
    variant="link"
    class="btn-tooltip btn-icon-only"
    :title="title"
    :aria-label="$t('global.ariaLabel.tooltip')"
  >
    <icon-tooltip />
  </b-button>
</template>

<script>
import IconTooltip from '@carbon/icons-vue/es/information/16';

export default {
  components: { IconTooltip },
  data() {
    title: {
      type: String,
      default: '',
    },
  },
};
</script>
```
