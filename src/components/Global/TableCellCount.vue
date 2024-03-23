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
import { useI18n } from 'vue-i18n';
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
  data() {
    return {
      $t: useI18n().t,
    };
  },
  computed: {
    filterActive() {
      return this.filteredItemsCount !== this.totalNumberOfCells;
    },
  },
};
</script>
