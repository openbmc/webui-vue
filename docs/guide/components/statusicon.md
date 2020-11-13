# StatusIcon

Status icon component is used to show the current status of data in form of an icon. The different states are `info`, `success`, `warning`, `delete` and `secondary`.

To use the component, import `StatusIcon` as component in each SFC.

```vue
import StatusIcon from '@/components/Global/StatusIcon'
```

Use `<status-icon/>` as tag inside HTML and pass the `status` as prop which is a an optional property.

## Status icon with default status

```vue
<status-icon />
```

<img :src="$withBase('/secondary.png')" alt="Secondary icon" style="max-width:40px; height:40px">

## Status icon with info status

```vue
<status-icon
:status="info"
/>
```

<img :src="$withBase('/info.png')" alt="Info icon" style="max-width:40px; height:40px">

## Status icon with success status

```vue
<status-icon
:status="success"
/>
```

<img :src="$withBase('/success.png')" alt="Success icon" style="max-width:40px; height:40px">

## Status icon with warning status

```vue
<status-icon
:status="warning"
/>
```

<img :src="$withBase('/warning.png')" alt="Warning icon" style="max-width:40px; height:40px">

## Status icon with danger status

```vue
<status-icon
:status="danger"
/>
```

<img :src="$withBase('/danger.png')" alt="Danger icon example" style="max-width:40px; height:40px">

### Optional property

- `status` - on the basis of status value respective icon will be visible

```vue
<template>
  <span :class="['status-icon', status]">
    <icon-info v-if="status === 'info'" />
    <icon-success v-else-if="status === 'success'" />
    <icon-warning v-else-if="status === 'warning'" />
    <icon-danger v-else-if="status === 'danger'" />
    <icon-secondary v-else />
  </span>
</template>

<script>
import IconInfo from '@carbon/icons-vue/es/information--filled/20';
import IconCheckmark from '@carbon/icons-vue/es/checkmark--filled/20';
import IconWarning from '@carbon/icons-vue/es/warning--filled/20';
import IconError from '@carbon/icons-vue/es/error--filled/20';
import IconMisuse from '@carbon/icons-vue/es/misuse/20';

export default {
  name: 'StatusIcon',
  components: {
    IconInfo: IconInfo,
    iconSuccess: IconCheckmark,
    iconDanger: IconMisuse,
    iconSecondary: IconError,
    iconWarning: IconWarning
  },
  props: {
    status: {
      type: String,
      default: ''
    }
  }
};
</script>

<style lang="scss">
@import "src/assets/styles/bmc/helpers";
@import "src/assets/styles/bootstrap/helpers";
.status-icon {
  vertical-align: text-bottom;
  &.info {
    color: theme-color('info');
  }
  &.success {
    color: theme-color('success');
  }
  &.danger {
    color: theme-color('danger');
  }
  &.secondary {
    color: gray('600');

    svg {
      transform: rotate(-45deg);
    }
  }
  &.warning {
    color: theme-color('warning');
  }

  svg {
    fill: currentColor;
  }
}
</style>
```
