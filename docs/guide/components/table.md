# Table

All tables in the application are using the [BoostrapVue table component](https://bootstrap-vue.org/docs/components/table).

To use the component, include the `<b-table>` tag in the template. The component is registered globally so does not need to be imported in each SFC.

## Basic table
There are a few required properties to maintain consistency across the application. The full list of options can be viewed on the [Bootstrap-vue table component's documentation page](https://bootstrap-vue.org/docs/components/table#comp-ref-b-table-props).


### Required properties

- `items` - renders table items
- `fields` - renders table header
- `hover` - enables table row hover state
- `responsive` or `stacked` - makes the table responsive (enables horizontal scrolling or stacked view) at the defined breakpoint
- `show-empty` *(required if table data is generated dynamically)* - shows an empty message if there are no items in the table
- `empty-text` *(required if table data is generated dynamically)* - the translated empty message

![Basic table example](/table.png)
![Basic empty table example](/table-empty.png)

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

## Sort

To enable table sort, include `sortable: true` in the fields array for sortable columns and add the following props to the `<b-table>` component:

- `sort-by`
- `no-sort-reset`
- `sort-icon-left`

![Table sort example](/table-sort.png)


```vue
<template>
  <b-table
    hover
    no-sort-reset
    sort-icon-left
    sort-by="rank"
    responsive="md"
    :items="items"
    :fields="fields"
  />
</template>
<script>
export default {
  data() {
    return {
      items: [...],
      fields: [
        {
          key: 'name',
          label: 'Name', //should be translated
          sortable: true
        },
        {
          key: 'rank',
          label: 'Rank', //should be translated
          sortable: true
        },
        {
          key: 'description',
          label: 'Description', //should be translated
          sortable: false
        }
      ]
    }
  }
}
</script>
```

## Expandable rows

To add an expandable row in the table, add a column for the expand button in the fields array. Include the tdClass `table-row-expand` to ensure icon rotation is handled. Use the built in [cell slot](https://bootstrap-vue.org/docs/components/table#comp-ref-b-table-slots) to target the expand button column and add a button with the chevron icon.

Include the [TableRowExpandMixin](https://github.com/openbmc/webui-vue/blob/master/src/components/Mixins/TableRowExpandMixin.js). The mixin contains the dynamic `aria-label` and `title` attribute values that need to be included with the expand button. The `toggleRowDetails` method should be the button's click event callback. Be sure to pass the `row` object to the function.

Use the [row-details slot](https://bootstrap-vue.org/docs/components/table#comp-ref-b-table-slots) to format the expanded row content. The slot has access to the row `item` property.

### Summary

1. Add a column for the expansion row button with the tdClass, `table-row-expand`
2. Include the `TableRowExpandMixin` to handle the dynamic aria label, title, and row expansion toggling
3. Use the `#cell` slot to target the expandable row column and add the button with accessible markup and click handler
4. Use the `#row-details` slot to format expanded row content

![Table row expand example](/table-expand-row.png)

```vue
<template>
  <b-table
    hover
    responsive="md"
    :items="items"
    :fields="fields"
  >
    <template #cell(expandRow)="row">
      <b-button
        variant="link"
        :aria-label="expandRowLabel"
        :title="expandRowLabel"
        @click="toggleRowDetails(row)"
      >
        <icon-chevron />
      </b-button>
    </template>
    <template #row-details="row">
      <h3>Expanded row details</h3>
      {{ row.item }}
    </template>
  </b-table>
</template>
<script>
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';
import TableRowExpandMixin, { expandRowLabel } from '@/components/Mixins/TableRowExpandMixin';

export default {
  components: { IconChevron },
  mixins: [ TableRowExpandMixin ],
  data() {
    return {
      items: [...],
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
        },
        ...
      ],
      expandRowLabel
    }
  }
}
</script>
```

<!-- ## Pagination -->
<!-- ## Row actions -->
<!-- ## Batch actions -->
<!-- ## Search -->
<!-- ## Filter -->
