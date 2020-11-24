<template>
  <div class="mt-2">
    <p v-if="!filterActive">
      {{ $t('global.table.items', { count: totalNumberOfCells }) }}
    </p>
    <p v-else>
      {{
        $t('global.table.selectedItems', {
          count: totalNumberOfCells,
          filterCount: filteredItemsCount,
        })
      }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    filteredItemsCount: {
      type: Number,
      required: true,
    },
    totalNumberOfCells: {
      type: Number,
      required: true,
    },
  },
  computed: {
    filterActive() {
      return this.filteredItemsCount !== this.totalNumberOfCells;
    },
  },
};
</script>
