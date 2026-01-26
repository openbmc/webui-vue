<template>
  <b-container fluid="xl">
    <page-title />

    <!-- Loading spinner -->
    <b-row v-if="isLoading && allSensors.length === 0" class="justify-content-center mb-3">
      <b-spinner label="Loading sensors" />
    </b-row>

    <!-- Error banner -->
    <b-row v-if="!isLoading && isError" class="mb-3">
      <b-col>
        <b-alert variant="danger" show>
          {{ t('global.status.error') }}: {{ errorMessage }}
        </b-alert>
      </b-col>
    </b-row>

    <!-- Controls row -->
    <b-row v-if="!isLoading || allSensors.length > 0" class="align-items-end">
      <b-col sm="6" md="5" xl="4">
        <search
          :placeholder="t('pageSensors.searchForSensors')"
          data-test-id="sensors-input-searchForSensors"
          @change-search="globalFilter = $event"
          @clear-search="globalFilter = ''"
        />
      </b-col>
      <b-col sm="3" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredSensors.length"
          :total-number-of-cells="allSensors.length"
        />
      </b-col>
      <b-col sm="3" md="4" xl="6" class="text-end">
        <table-filter :filters="tableFilters" @filter-change="onFilterChange" />
        <table-column-picker
          :columns="columnPickerOptions"
          @change="onColumnVisibilityChange"
        />
      </b-col>
    </b-row>

    <!-- Table toolbar -->
    <b-row>
      <b-col xl="12">
        <table-toolbar
          :selected-items-count="selectedRows.length"
          @clear-selected="table.resetRowSelection()"
        >
          <template #toolbar-buttons>
            <table-toolbar-export
              :data="selectedRows"
              :file-name="exportFileNameByDate()"
            />
          </template>
        </table-toolbar>

        <!-- TanStack Table with Bootstrap styling -->
        <div class="table-responsive" style="max-height: 75vh; overflow-y: auto">
          <table class="table table-hover b-table">
            <thead class="table-light sticky-top">
              <tr>
                <th
                  v-for="header in table.getHeaderGroups()[0].headers"
                  :key="header.id"
                  :class="{
                    'cursor-pointer': header.column.getCanSort(),
                    'text-nowrap': header.id === 'Status',
                  }"
                  @click="header.column.getToggleSortingHandler()?.($event)"
                >
                  <template v-if="header.id === 'select'">
                    <b-form-checkbox
                      :model-value="table.getIsAllRowsSelected()"
                      :indeterminate="table.getIsSomeRowsSelected()"
                      @change="table.toggleAllRowsSelected()"
                    >
                      <span class="visually-hidden">{{ t('global.table.selectAll') }}</span>
                    </b-form-checkbox>
                  </template>
                  <template v-else>
                    <flex-render
                      :render="header.column.columnDef.header"
                      :props="header.getContext()"
                    />
                    <span v-if="header.column.getIsSorted()">
                      {{ header.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓' }}
                    </span>
                  </template>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                :class="{ 'table-active': row.getIsSelected() }"
              >
                <td
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  :class="{ 'text-nowrap': cell.column.id === 'Status' }"
                >
                  <template v-if="cell.column.id === 'select'">
                    <b-form-checkbox
                      :model-value="row.getIsSelected()"
                      @change="row.toggleSelected()"
                    >
                      <span class="visually-hidden">{{ t('global.table.selectItem') }}</span>
                    </b-form-checkbox>
                  </template>
                  <template v-else-if="cell.column.id === 'Status'">
                    <status-icon :status="statusIcon(cell.getValue() as string | null | undefined)" />
                    {{ cell.getValue() ?? '--' }}
                  </template>
                  <template v-else-if="isValueWithUnitsColumn(cell.column.id)">
                    {{ formatValue(cell.getValue()) }} {{ getUnits(row.original) }}
                  </template>
                  <template v-else>
                    <flex-render
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </template>
                </td>
              </tr>
              <tr v-if="table.getRowModel().rows.length === 0">
                <td :colspan="columns.length" class="text-center">
                  {{ globalFilter ? t('global.table.emptySearchMessage') : t('global.table.emptyMessage') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
/**
 * Sensors Page - Vue Query + TanStack Table Implementation
 *
 * Redfish-first approach:
 * - Uses Redfish types directly (Sensor, ThermalFan, ThermalTemperature, PowerVoltage)
 * - Property accessors handle schema differences
 * - Uses optimized fetching with $select and $expand when supported
 */
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  FlexRender,
  ColumnDef,
  SortingState,
  RowSelectionState,
} from '@tanstack/vue-table';

import PageTitle from '@/components/Global/PageTitle.vue';
import Search from '@/components/Global/Search.vue';
import StatusIcon from '@/components/Global/StatusIcon.vue';
import TableFilter from '@/components/Global/TableFilter.vue';
import TableColumnPicker, { ColumnOption } from '@/components/Global/TableColumnPicker.vue';
import TableToolbar from '@/components/Global/TableToolbar.vue';
import TableToolbarExport from '@/components/Global/TableToolbarExport.vue';
import TableCellCount from '@/components/Global/TableCellCount.vue';

import { useAllSubResources } from '@/api/composables/useRedfishCollection';
import { formatValue, statusIcon } from '@/components/Composables/useDataFormatter';
import { makeStatusSortingFn } from '@/components/Composables/useTable';
import { Sensor } from '@/api/model/Sensor';

const { t } = useI18n();

const valueWithUnitsColumnIds = new Set([
  'Reading',
  'LowerCritical',
  'LowerCaution',
  'UpperCaution',
  'UpperCritical',
  'LowerFatal',
  'UpperFatal',
] as const);

function isValueWithUnitsColumn(columnId: string): boolean {
  return valueWithUnitsColumnIds.has(columnId as (typeof valueWithUnitsColumnIds extends Set<infer U> ? U : string));
}

// ============================================================================
// Data Fetching via Vue Query (Optimized)
// ============================================================================

/**
 * Fetch all sensors from all chassis using optimized strategy:
 * 1. Uses $select to get Sensors URIs efficiently (if supported)
 * 2. Uses $expand to fetch each Sensors collection (if supported)
 * 3. Falls back gracefully when features not supported
 */
const { data: sensorsData, isLoading, isError, error } = useAllSubResources<Sensor>(
  '/redfish/v1/Chassis',
  'Sensors',
);

const errorMessage = computed(() => {
  if (!error.value) return t('global.status.error');
  const e = error.value as unknown as { message?: string };
  return e?.message || String(error.value);
});

// All sensors as Sensor array
const allSensors = computed<Sensor[]>(() => sensorsData.value ?? []);

// ============================================================================
// Property Accessors (Handle Redfish schema differences)
// ============================================================================

function getNumericField(
  obj: Record<string, unknown>,
  field: string,
): number | null {
  const value = obj[field];
  return typeof value === 'number' ? value : null;
}

function hasField(sensor: Sensor, field: string): boolean {
  return (sensor as unknown as Record<string, unknown>)[field] !== undefined;
}

function getReading(sensor: Sensor): number | null {
  if (sensor.Reading != null) return sensor.Reading;

  // Some implementations expose legacy schema fields not present in `Sensor`.
  const s = sensor as unknown as Record<string, unknown>;
  return (
    getNumericField(s, 'ReadingCelsius') ??
    getNumericField(s, 'ReadingVolts') ??
    null
  );
}

function getUnits(sensor: Sensor): string {
  if (sensor.ReadingUnits) return sensor.ReadingUnits;
  if (hasField(sensor, 'ReadingCelsius')) return '℃';
  if (hasField(sensor, 'ReadingVolts')) return 'V';
  return '';
}

function getStatus(sensor: Sensor): string | null {
  return sensor.Status?.Health ?? null;
}

function getLowerCritical(sensor: Sensor): number | null {
  if ('Thresholds' in sensor) return sensor.Thresholds?.LowerCritical?.Reading ?? null;
  return getNumericField(
    sensor as unknown as Record<string, unknown>,
    'LowerThresholdCritical',
  );
}

function getUpperCritical(sensor: Sensor): number | null {
  if ('Thresholds' in sensor) return sensor.Thresholds?.UpperCritical?.Reading ?? null;
  return getNumericField(
    sensor as unknown as Record<string, unknown>,
    'UpperThresholdCritical',
  );
}

function getLowerCaution(sensor: Sensor): number | null {
  if ('Thresholds' in sensor) return sensor.Thresholds?.LowerCaution?.Reading ?? null;
  return getNumericField(
    sensor as unknown as Record<string, unknown>,
    'LowerThresholdNonCritical',
  );
}

function getUpperCaution(sensor: Sensor): number | null {
  if ('Thresholds' in sensor) return sensor.Thresholds?.UpperCaution?.Reading ?? null;
  return getNumericField(
    sensor as unknown as Record<string, unknown>,
    'UpperThresholdNonCritical',
  );
}

function getLowerFatal(sensor: Sensor): number | null {
  if ('Thresholds' in sensor) return (sensor.Thresholds as { LowerFatal?: { Reading?: number } })?.LowerFatal?.Reading ?? null;
  return getNumericField(
    sensor as unknown as Record<string, unknown>,
    'LowerThresholdFatal',
  );
}

function getUpperFatal(sensor: Sensor): number | null {
  if ('Thresholds' in sensor) return sensor.Thresholds?.UpperFatal?.Reading ?? null;
  return getNumericField(
    sensor as unknown as Record<string, unknown>,
    'UpperThresholdFatal',
  );
}

// ============================================================================
// Table State & Configuration
// ============================================================================

const globalFilter = ref('');
const sorting = ref<SortingState>([{ id: 'Status', desc: true }]);
const rowSelection = ref<RowSelectionState>({});
const activeFilters = ref<Array<{ key: string; values: string[] }>>([]);
const visibleColumnIds = ref<string[]>([]);

// Table filters configuration
const tableFilters = computed(() => [
  {
    key: 'Status',
    label: t('pageSensors.table.status'),
    values: ['OK', 'Warning', 'Critical'],
  },
]);

// Column picker options - defines which columns are available and their defaults
const columnPickerOptions = computed<ColumnOption[]>(() => [
  { id: 'Id', label: t('pageSensors.table.id'), default: false },
  { id: 'Name', label: t('pageSensors.table.name'), default: true },
  { id: 'Status', label: t('pageSensors.table.status'), default: true },
  { id: 'LowerFatal', label: t('pageSensors.table.lowerFatal'), default: false },
  { id: 'LowerCritical', label: t('pageSensors.table.lowerCritical'), default: true },
  { id: 'LowerCaution', label: t('pageSensors.table.lowerWarning'), default: true },
  { id: 'Reading', label: t('pageSensors.table.currentValue'), default: true },
  { id: 'UpperCaution', label: t('pageSensors.table.upperWarning'), default: true },
  { id: 'UpperCritical', label: t('pageSensors.table.upperCritical'), default: true },
  { id: 'UpperFatal', label: t('pageSensors.table.upperFatal'), default: false },
]);

// All possible column definitions (keyed by id for lookup)
const allColumnDefs: Record<string, ColumnDef<Sensor>> = {
  select: { id: 'select', header: '', enableSorting: false },
  Id: { accessorKey: 'Id', header: () => t('pageSensors.table.id'), enableSorting: true },
  Name: { accessorKey: 'Name', header: () => t('pageSensors.table.name'), enableSorting: true },
  Status: {
    id: 'Status',
    accessorFn: getStatus,
    header: () => t('pageSensors.table.status'),
    enableSorting: true,
    sortingFn: makeStatusSortingFn<Sensor>(),
  },
  LowerFatal: { id: 'LowerFatal', accessorFn: getLowerFatal, header: () => t('pageSensors.table.lowerFatal') },
  LowerCritical: { id: 'LowerCritical', accessorFn: getLowerCritical, header: () => t('pageSensors.table.lowerCritical') },
  LowerCaution: { id: 'LowerCaution', accessorFn: getLowerCaution, header: () => t('pageSensors.table.lowerWarning') },
  Reading: { id: 'Reading', accessorFn: getReading, header: () => t('pageSensors.table.currentValue') },
  UpperCaution: { id: 'UpperCaution', accessorFn: getUpperCaution, header: () => t('pageSensors.table.upperWarning') },
  UpperCritical: { id: 'UpperCritical', accessorFn: getUpperCritical, header: () => t('pageSensors.table.upperCritical') },
  UpperFatal: { id: 'UpperFatal', accessorFn: getUpperFatal, header: () => t('pageSensors.table.upperFatal') },
};

// Build columns array based on visible column IDs (preserving order from columnPickerOptions)
const columns = computed<ColumnDef<Sensor>[]>(() => {
  const visibleSet = new Set(visibleColumnIds.value);
  const result: ColumnDef<Sensor>[] = [allColumnDefs.select]; // Always include select column

  // Add columns in the order defined by columnPickerOptions
  for (const option of columnPickerOptions.value) {
    if (visibleSet.has(option.id) && allColumnDefs[option.id]) {
      result.push(allColumnDefs[option.id]);
    }
  }

  return result;
});

function onColumnVisibilityChange(ids: string[]) {
  visibleColumnIds.value = ids;
}

// Helper to get cell value from a sensor based on column definition
function getCellValue(sensor: Sensor, col: ColumnDef<Sensor>): unknown {
  if ('accessorFn' in col && col.accessorFn) {
    return col.accessorFn(sensor, 0);
  } else if ('accessorKey' in col && col.accessorKey) {
    return (sensor as unknown as Record<string, unknown>)[col.accessorKey as string];
  }
  return undefined;
}

// Filtered data based on status filter AND global search (against visible columns only)
// We handle global filtering here instead of in TanStack to ensure reactivity when columns change
const filteredSensors = computed<Sensor[]>(() => {
  let result = allSensors.value;

  // Apply status filter
  if (activeFilters.value.length > 0) {
    result = result.filter((sensor) => {
      for (const filter of activeFilters.value) {
        if (filter.key === 'Status' && filter.values.length > 0) {
          const status = getStatus(sensor);
          if (!status || !filter.values.includes(status)) return false;
        }
      }
      return true;
    });
  }

  // Apply global search filter against visible columns only
  if (globalFilter.value) {
    const searchLower = globalFilter.value.toLowerCase();
    const visibleColumns = columns.value;

    result = result.filter((sensor) => {
      for (const col of visibleColumns) {
        if (col.id === 'select') continue;

        const cellValue = getCellValue(sensor, col);
        if (cellValue != null && String(cellValue).toLowerCase().includes(searchLower)) {
          return true;
        }
      }
      return false;
    });
  }

  return result;
});

// TanStack Table instance
// Note: Global filtering is handled in filteredSensors computed (above) to ensure
// reactivity when visible columns change. TanStack only handles sorting and selection.
const table = useVueTable({
  get data() {
    return filteredSensors.value;
  },
  get columns() {
    return columns.value;
  },
  state: {
    get sorting() {
      return sorting.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater;
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  enableRowSelection: true,
  getRowId: (row) => row['@odata.id'] ?? row.Id ?? row.Name ?? '',
});

// Selected rows for export
const selectedRows = computed(() =>
  table.getSelectedRowModel().rows.map((row) => row.original)
);

// ============================================================================
// Helpers
// ============================================================================

function onFilterChange({ activeFilters: filters }: { activeFilters: Array<{ key: string; values: string[] }> }) {
  activeFilters.value = filters;
}

function exportFileNameByDate(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10) + '_' + date.toString().split(':').join('-').split(' ')[4];
  return t('pageSensors.exportFilePrefix') + dateStr;
}

// Clear selection when filters or columns change
watch([globalFilter, activeFilters, visibleColumnIds], () => {
  table.resetRowSelection();
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
