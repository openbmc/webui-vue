<template>
  <b-container fluid="xl">
    <page-title />
    <b-row class="align-items-end">
      <b-col sm="6" md="5" xl="4">
        <search
          :placeholder="$t('pageSensors.searchForSensors')"
          data-test-id="sensors-input-searchForSensors"
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
      </b-col>
      <b-col sm="3" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="activeSensors.length"
        ></table-cell-count>
      </b-col>
      <b-col sm="3" md="4" xl="6" class="text-end">
        <table-filter :filters="tableFilters" @filter-change="onFilterChange" />
      </b-col>
    </b-row>
    <!-- Chassis tabs: only rendered when there are multiple chassis -->
    <b-row v-if="sensorsByChassis.length > 1">
      <b-col>
        <b-card no-body>
          <b-tabs
            class="mb-2"
            :model-value="activeTabId"
            active-nav-item-class="fw-bold"
            content-class="p-0"
            @update:model-value="onTabChange"
          >
            <b-tab
              v-for="group in sensorsByChassis"
              :id="tabId(group.chassisId)"
              :key="group.chassisId"
              :title="group.chassisName || group.chassisId"
            />
          </b-tabs>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="12">
        <table-toolbar
          ref="toolbar"
          :selected-items-count="
            Array.isArray(selectedRows) ? selectedRows.length : 0
          "
          @clear-selected="clearSelectedRows(table)"
        >
          <template #toolbar-buttons>
            <table-toolbar-export
              :data="selectedRows"
              :file-name="exportFileNameByDate()"
            />
          </template>
        </table-toolbar>
        <b-table
          ref="table"
          responsive="md"
          selectable
          no-select-on-click
          sort-icon-left
          hover
          must-sort
          sticky-header="75vh"
          thead-class="table-light"
          :sort-by="['status']"
          show-empty
          :items="filteredSensors"
          :fields="fields"
          :sort-desc="[true]"
          :filter="searchFilter"
          :empty-text="$t('global.table.emptyMessage')"
          :empty-filtered-text="$t('global.table.emptySearchMessage')"
          :busy="isBusy"
          @filtered="onFiltered"
          @row-selected="onRowSelected($event, filteredSensors.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              @change="onChangeHeaderCheckbox($refs.table, $event)"
            >
              <span class="visually-hidden-focusable">
                {{ $t('global.table.selectAll') }}
              </span>
            </b-form-checkbox>
          </template>
          <template #cell(checkbox)="row">
            <b-form-checkbox
              v-model="row.rowSelected"
              @change="toggleSelectRow($refs.table, row.index)"
            >
              <span class="visually-hidden-focusable">
                {{ $t('global.table.selectItem') }}
              </span>
            </b-form-checkbox>
          </template>

          <template #cell(status)="{ value }">
            <status-icon :status="statusIcon(value)" /> {{ value }}
          </template>
          <template #cell(currentValue)="data">
            {{ data.value }}{{ data.item.currentValueDisplay }}
          </template>
          <template #cell(lowerCaution)="data">
            {{ data.value }}{{ data.item.lowerCautionDisplay }}
          </template>
          <template #cell(upperCaution)="data">
            {{ data.value }}{{ data.item.upperCautionDisplay }}
          </template>
          <template #cell(lowerCritical)="data">
            {{ data.value }}{{ data.item.lowerCriticalDisplay }}
          </template>
          <template #cell(upperCritical)="data">
            {{ data.value }}{{ data.item.upperCriticalDisplay }}
          </template>
        </b-table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import PageTitle from '@/components/Global/PageTitle';
import Search from '@/components/Global/Search';
import TableFilter from '@/components/Global/TableFilter';
import TableToolbar from '@/components/Global/TableToolbar';
import TableToolbarExport from '@/components/Global/TableToolbarExport';
import TableCellCount from '@/components/Global/TableCellCount';

import { useTableSelection } from '@/components/Composables/useTableSelection';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';
import { useTableFilter } from '@/components/Composables/useTableFilter';
import { useDataFormatter } from '@/components/Composables/useDataFormatter';
import { useSensors } from '@/components/Composables/useSensors';
import i18n from '@/i18n';

const { startLoader, endLoader, hideLoader } = useLoadingBar();
const { dataFormatter } = useDataFormatter();
const { getFilteredTableData } = useTableFilter();
const {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
  onRowSelected,
  onChangeHeaderCheckbox,
  toggleSelectRow,
  clearSelectedRows,
} = useTableSelection();

const {
  data: allSensors,
  sensorsByChassis,
  isLoading,
  isFetching,
} = useSensors();

const table = ref(null);
const searchFilter = ref('');
const searchTotalFilteredRows = ref(0);
const activeFilters = ref([]);

// Active chassis tab, keyed by chassisId so refetches that reorder the groups
// never show the wrong chassis's sensors.
const activeChassisId = ref<string | null>(null);

// Select the first chassis once data arrives, and fall back to it if the
// selected chassis disappears after a refetch.
watch(
  sensorsByChassis,
  (groups) => {
    if (!groups.length) return;
    if (!groups.some((g) => g.chassisId === activeChassisId.value)) {
      activeChassisId.value = groups[0].chassisId;
    }
  },
  { immediate: true },
);

// BTabs matches the active tab by DOM id, so give every tab a stable, explicit
// id. Auto-generated ids can disagree on mount (e.g. when cached data renders
// the tabs immediately on a page revisit), leaving no tab selected.
const tabId = (chassisId) => `sensors-tab-${chassisId}`;

const activeTabId = computed(() =>
  activeChassisId.value ? tabId(activeChassisId.value) : undefined,
);

// Single chassis: show every sensor, no tabs. Multiple: show the active one.
const activeSensors = computed(() => {
  if (sensorsByChassis.value.length <= 1) {
    return allSensors.value ?? [];
  }
  const group = sensorsByChassis.value.find(
    (g) => g.chassisId === activeChassisId.value,
  );
  return group ? group.sensors : [];
});

const fields = [
  {
    key: 'checkbox',
    sortable: false,
    label: '',
  },
  {
    key: 'name',
    sortable: true,
    label: i18n.global.t('pageSensors.table.name'),
  },
  {
    key: 'status',
    sortable: true,
    label: i18n.global.t('pageSensors.table.status'),
    tdClass: 'text-nowrap',
  },
  {
    key: 'lowerCritical',
    formatter: dataFormatter,
    label: i18n.global.t('pageSensors.table.lowerCritical'),
  },
  {
    key: 'lowerCaution',
    formatter: dataFormatter,
    label: i18n.global.t('pageSensors.table.lowerWarning'),
  },
  {
    key: 'currentValue',
    formatter: dataFormatter,
    label: i18n.global.t('pageSensors.table.currentValue'),
  },
  {
    key: 'upperCaution',
    formatter: dataFormatter,
    label: i18n.global.t('pageSensors.table.upperWarning'),
  },
  {
    key: 'upperCritical',
    formatter: dataFormatter,
    label: i18n.global.t('pageSensors.table.upperCritical'),
  },
];

const tableFilters = [
  {
    key: 'status',
    label: i18n.global.t('pageSensors.table.status'),
    values: [
      i18n.global.t('global.action.ok'),
      i18n.global.t('global.action.warning'),
      i18n.global.t('global.action.critical'),
    ],
  },
];

const filteredSensors = computed(() => {
  return getFilteredTableData(activeSensors.value, activeFilters.value);
});

const filteredRows = computed(() => {
  return searchFilter.value
    ? searchTotalFilteredRows.value
    : filteredSensors.value.length;
});

const isBusy = computed(() => isLoading.value || isFetching.value);

// Clear selection when switching tabs so rows selected on one chassis are not
// shown as selected (or exported) on another.
function onTabChange(id) {
  const group = sensorsByChassis.value.find((g) => tabId(g.chassisId) === id);
  if (!group || group.chassisId === activeChassisId.value) return;
  activeChassisId.value = group.chassisId;
  clearSelectedRows(table.value);
}

function onFilterChange({ activeFilters: filters }) {
  activeFilters.value = filters;
}

function onFiltered(filteredItems) {
  searchTotalFilteredRows.value = filteredItems.length;
}

function onChangeSearchInput(event) {
  searchFilter.value = event;
}

function onClearSearchInput() {
  searchFilter.value = '';
}

function exportFileNameByDate() {
  // Create export file name based on date
  let date = new Date();
  date =
    date.toISOString().slice(0, 10) +
    '_' +
    date.toString().split(':').join('-').split(' ')[4];
  return i18n.global.t('pageSensors.exportFilePrefix') + date;
}

function statusIcon(status) {
  switch (status) {
    case 'OK':
      return 'success';
    case 'Warning':
      return 'warning';
    case 'Critical':
      return 'danger';
    case 'Unknown':
      return '';
    default:
      return '';
  }
}

// Watch loading state and control loading bar
watch(
  isBusy,
  (loading) => {
    if (loading) {
      startLoader();
    } else {
      endLoader();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  hideLoader();
});
</script>
