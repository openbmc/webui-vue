<template>
  <p v-if="!filterActive" class="tableCount">{{ totalNumberOfCells }} cells</p>
  <p v-else class="tableCount">
    {{ selectedItemsCount }} cells of {{ totalNumberOfCells }}
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
