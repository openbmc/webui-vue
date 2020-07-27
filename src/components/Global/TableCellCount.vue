<template>
  <p v-if="!filterActive" class="m-0 pt-2">
    {{ $t('global.table.items', { count: totalNumberOfCells }) }}
  </p>
  <p v-else class="m-0 pt-2">
    {{
      $t('global.table.selectedItems', {
        count: totalNumberOfCells,
        filterCount: filteredItemsCount
      })
    }}
  </p>
</template>

<script>
export default {
  props: {
    filteredItemsCount: {
      type: Number,
      required: true
    },
    totalNumberOfCells: {
      type: Number,
      required: true
    }
  },
  computed: {
    filterActive() {
      return this.filteredItemsCount !== this.totalNumberOfCells;
    }
  }
};
</script>
