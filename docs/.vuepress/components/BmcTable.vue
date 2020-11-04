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
  />
</template>

<script>
export default {
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
      ]
    }
  }
}
</script>