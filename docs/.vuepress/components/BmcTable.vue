<template>
  <b-table
    hover
    show-empty
    no-sort-reset
    sort-icon-left
    responsive="md"
    head-variant="light"
    table-variant="light"
    sort-by="rank"
    :items="items"
    :fields="fields"
  >
    <!-- Expand chevron icon -->
    <template #cell(expandRow)="row">
      <b-button
        variant="link"
        :aria-label="expandRowLabel"
        @click="toggleRowDetails(row)"
      >
        <icon-chevron :title="expandRowLabel" />
      </b-button>
    </template>

    <!-- Expansion row -->
    <template #row-details="{ item }">
      <h3>Expanded row details</h3>
      {{ item }}
    </template>
  </b-table>
</template>

<script>
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';

export default {
  components: {IconChevron},
  data() {
    return {
      items: [
        {
          name: 'Veracruz All Natural',
          rank: 1,
          description: 'Authentic Mexican Food, Smoothies, and Juices'
        },
        {
          name: 'Torchy\'s Tacos',
          rank: 3,
          description: 'At Torchy\'s Tacos, we make food that breaks the mold.'
        },
        {
          name: 'Tacodeli',
          rank: 2,
          description: 'Tacodeli handcrafts Mexican-inspired, creative tacos with local and organic ingredients topped with award-winning salsas.'
        },
      ],
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
          sortable: false,
        },
        {
          key: 'name',
          label: 'Name',
          sortable: true
        },
        {
          key: 'rank',
          label: 'Rank',
          sortable: true
        },
        {
          key: 'description',
          label: 'Description',
          sortable: false
        }
      ],
      expandRowLabel: 'Expand table row'
    }
  },
  methods: {
    toggleRowDetails(row) {
      row.toggleDetails();
      row.detailsShowing
        ? (this.expandRowLabel = 'Expand table row')
        : (this.expandRowLabel = 'Collapse table row');
    },
  },
}
</script>