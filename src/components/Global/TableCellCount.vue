<template>
  <p v-if="!filterActive" class="tableCount">
    {{ $t('global.table.items', { count: totalNumberOfCells }) }}
  </p>
  <p v-else class="tableCount">
    {{
      $t('global.table.selectedItems', {
        count: totalNumberOfCells,
        selCount: selectedItemsCount
      })
    }}
  </p>
</template>

<script>
export default {
  props: {
    selectedItemsCount: {
      type: Number,
      required: true
    },
    filterActive: {
      type: Boolean,
      required: true,
      default: () => false
    },
    totalNumberOfCells: {
      type: Number,
      required: true
    }
  }
};
</script>
<style scoped lang="scss">
.tableCount {
  margin: 0;
  padding-top: 0.5rem;
}
</style>
