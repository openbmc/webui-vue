# ToolTip

Tooltips used in entire application are using [BoostrapVue tooltips component](https://bootstrap-vue.org/docs/components/tooltip)

Info tooltip component is a pop-up that shows information or a message when users hover, click, focus, or touch an [information icon](https://www.carbondesignsystem.com/guidelines/icons/library/).

To use the component, import `InfoTooltip` as component in each SFC.

```vue
import InfoTooltip from '@/components/Global/InfoTooltip'
```

Use `<info-tooltip/>` as tag inside HTML and pass the `title` as prop which is a an optional data.

## Basic tooltip

```vue
<info-tooltip />
```

## Tooltip with title prop

```vue
<info-tooltip
:title="Title" //should be translated
/>
```

<br/>

### Optional properties

- `title` - show title on hover, click and focus state

<img :src="$withBase('/tooltip.png')" alt="Tooltip example" style="max-width:250px">

<br/>

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

<style lang="scss" scoped>
.btn-tooltip {
  padding: 0;
  line-height: 1em;
  svg {
    vertical-align: baseline;
  }
}
</style>
```
