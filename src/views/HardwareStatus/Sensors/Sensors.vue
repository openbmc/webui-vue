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
          :total-number-of-cells="allSensors.length"
        ></table-cell-count>
      </b-col>
      <b-col sm="3" md="4" xl="6" class="text-end">
        <table-filter :filters="tableFilters" @filter-change="onFilterChange" />
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="12">
        <table-toolbar
          ref="toolbar"
          :selected-items-count="
            Array.isArray(selectedRows) ? selectedRows.length : 0
          "
          @clear-selected="clearSelectedRows($refs.table)"
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
            {{ data.value }} {{ data.item.units }}
          </template>
          <template #cell(lowerCaution)="data">
            {{ data.value }} {{ data.item.units }}
          </template>
          <template #cell(upperCaution)="data">
            {{ data.value }} {{ data.item.units }}
          </template>
          <template #cell(lowerCritical)="data">
            {{ data.value }} {{ data.item.units }}
          </template>
          <template #cell(upperCritical)="data">
            {{ data.value }} {{ data.item.units }}
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

const { data: sensorsData, isLoading, isFetching } = useSensors();

const searchFilter = ref('');
const searchTotalFilteredRows = ref(0);
const activeFilters = ref([]);

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

const allSensors = computed(() => sensorsData.value || []);

const filteredSensors = computed(() => {
  return getFilteredTableData(allSensors.value, activeFilters.value);
});

const filteredRows = computed(() => {
  return searchFilter.value
    ? searchTotalFilteredRows.value
    : filteredSensors.value.length;
});

const isBusy = computed(() => isLoading.value || isFetching.value);

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
    default:
      return '';
  }
}

// Watch loading state and control loading bar
watch(
  () => isLoading.value || isFetching.value,
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
