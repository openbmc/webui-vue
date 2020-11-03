# ToolTip

Tool tip used in entire application is using  

Info tool tip component is a pop-up that shows information or a message when users hover, click, focus, or touch an image, button, anchor tag, etc.

## Basic tool tip
To use the component, include the `<b-button>` and `<icon-tooltip />` tag in the template. The component is registered globally so does not need to be imported in each SFC.

<br/>

### Required properties

- `title` - show title on hover, click and focus state

<br/>

  <b-button
    :title="title"
  />

<br/>

```vue
<template>
  <b-button v-b-tooltip variant="link" class="btn-tooltip" :title="title">
    <span class="sr-only">{{ $t('global.ariaLabel.tooltip') }}</span>
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
      default: 'Hey',
    },
  },
};
</script>
```
