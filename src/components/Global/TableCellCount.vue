<template>
  <div class="mt-2">
    <p v-if="!filterActive">
      {{ t('global.table.items', { count: totalNumberOfCells }) }}
    </p>
    <p v-else>
      {{
        t('global.table.selectedItems', {
          count: totalNumberOfCells,
          filterCount: filteredItemsCount,
        })
      }}
    </p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed, watch } from 'vue';
const { t } = useI18n();
const { filteredItemsCount, totalNumberOfCells } = defineProps({
  filteredItemsCount: {
    type: Number,
    required: true,
  },
  totalNumberOfCells: {
    type: Number,
    required: true,
  },
});
const filterActive = computed(() => {
  return filteredItemsCount !== totalNumberOfCells;
});
</script>
