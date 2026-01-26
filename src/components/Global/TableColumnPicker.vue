<template>
  <div class="table-column-picker d-inline-block">
    <b-dropdown
      variant="link"
      no-caret
      right
      data-test-id="tableColumnPicker-dropdown"
      @hide="dropdownVisible = false"
      @show="dropdownVisible = true"
    >
      <template #button-content>
        <icon-column />
        {{ $t('global.action.columns') }}
      </template>
      <div class="px-3 py-2">
        <b-form-group :label="$t('global.table.visibleColumns')">
          <b-form-checkbox-group v-model="selectedColumns">
            <b-form-checkbox
              v-for="column in selectableColumns"
              :key="column.id"
              :value="column.id"
              :data-test-id="`tableColumnPicker-checkbox-${column.id}`"
            >
              <span class="dropdown-item-text">{{ column.label }}</span>
            </b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
      </div>
      <div class="px-3 pb-2 d-flex gap-2">
        <b-button
          size="sm"
          variant="secondary"
          data-test-id="tableColumnPicker-button-showAll"
          @click="showAllColumns"
        >
          {{ $t('global.action.showAll') }}
        </b-button>
        <b-button
          size="sm"
          variant="secondary"
          data-test-id="tableColumnPicker-button-reset"
          @click="resetToDefault"
        >
          {{ $t('global.action.reset') }}
        </b-button>
      </div>
    </b-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import IconColumn from '@carbon/icons-vue/es/column/20';

export interface ColumnOption {
  id: string;
  label: string;
  default?: boolean; // Whether this column is shown by default
  required?: boolean; // Whether this column cannot be hidden
}

const props = defineProps<{
  columns: ColumnOption[];
}>();

const emit = defineEmits<{
  (e: 'change', visibleIds: string[]): void;
}>();

const dropdownVisible = ref(false);

// Initialize with default columns
const defaultColumnIds = computed(() =>
  props.columns.filter((c) => c.default !== false).map((c) => c.id)
);

const requiredColumnIds = computed(() =>
  props.columns.filter((c) => c.required).map((c) => c.id)
);

const selectableColumns = computed(() =>
  props.columns.filter((c) => !c.required)
);

const selectedColumns = ref<string[]>([...defaultColumnIds.value]);

// Emit changes when selection changes
watch(
  selectedColumns,
  (newValue) => {
    // Always include required columns
    const visibleIds = [...new Set([...requiredColumnIds.value, ...newValue])];
    emit('change', visibleIds);
  },
  { immediate: true }
);

function showAllColumns() {
  selectedColumns.value = props.columns.map((c) => c.id);
}

function resetToDefault() {
  selectedColumns.value = [...defaultColumnIds.value];
}
</script>

<style lang="scss" scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
