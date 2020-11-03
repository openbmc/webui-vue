# Table

All tables in the application are using the [BoostrapVue table component](https://bootstrap-vue.org/docs/components/table).

To use the component, include the `<b-table>` tag in the template. The component is registered globally so does not need to be imported in each SFC.

There are a few required properties to maintain consistency across the application. The full list of options are available [here](https://bootstrap-vue.org/docs/components/table#comp-ref-b-table-props).

- `items` *(required)* - renders table items
- `fields` *(required)* - renders table header
- `hover` *(required)* - enables table row hover state
- `show-empty` *(required)* - shows an empty message if there are no items in the table
- `empty-text` *(required)* - the translated empty message
- `responsive` or `stacked` *(required)* - makes the table responsive (enables horizontal scrolling or stacked view) at the defined breakpoint


## Basic table

<b-table
  :fields="['Name', 'Age', 'Color']"
  :items="[
    {Name: 'Babe', Age: '3 years', Color: 'white, orange, grey' },
    {Name: 'Grey Boy', Age: '4 months', Color: 'grey' }
  ]"
  hover
  head-variant="light"
  table-variant="light"
/>

#### Empty table

<b-table
  show-empty
  hover
  :fields="['Name', 'Age', 'Color']"
  head-variant="light"
  table-variant="light"
  empty-text="No items available"
/>

```vue
<template>
  <b-table
    hover
    show-empty
    responsive="md"
    :items="items"
    :fields="fields"
    :empty-text="$t('global.table.emptyMessage')"
  />
</template>

<script>
  export default {
    data() {
      items: [
        {
          name: 'Babe',
          age: '3 years',
          color: 'white, orange, grey'
        },
        {
          name: 'Grey Boy',
          age: '4 months',
          color: 'grey'
        },
      ],
      fields: [
        {
          key: 'name',
          label: this.$t('table.name') //translated label
        },
        {
          key: 'age',
          label: this.$t('table.age') //translated label
        },
        {
          key: 'color',
          label: this.$t('table.color') // translated label
        }
      ]
    }
  }
</script>
```

<!-- ## Table with row actions, sort, and exapndable rows -->
<!-- ## Table with pagination -->
<!-- ## Table with batch actions -->
<!-- ## Table with search and filter -->
