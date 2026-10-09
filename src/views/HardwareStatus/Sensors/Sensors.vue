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
    <b-row>
      <b-col xl="12">
        <!--
          The toolbar and table live inside the active tab pane so the pane
          that assistive tech lands on holds the content. With a single
          chassis the tab navigation is hidden, so the page looks unchanged.
        -->
        <b-card
          no-body
          :class="{
            'border-0 bg-transparent': !hasMultipleChassis,
            'sensors-table-tabs': hasMultipleChassis,
            'sensors-table-single': !hasMultipleChassis,
          }"
        >
          <b-tabs
            v-model:index="activeTabIndex"
            active-nav-item-class="fw-bold"
            :nav-wrapper-class="hasMultipleChassis ? '' : 'd-none'"
            @update:index="onTabChange"
          >
            <b-tab
              v-for="group in tabGroups"
              :key="group.chassisId"
              :title="
                group.chassisId === '__placeholder__'
                  ? ''
                  : group.chassisName || group.chassisId
              "
            >
              <template v-if="isActiveGroup(group)">
                <!-- Error state for an individual chassis sensor fetch -->
                <b-alert v-if="group.isError" variant="danger" show class="m-3">
                  {{
                    $t('pageSensors.chassisLoadError', {
                      chassis: group.chassisName || group.chassisId,
                    })
                  }}
                </b-alert>
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
                  :ref="setTableRef"
                  responsive="md"
                  selectable
                  no-select-on-click
                  sort-icon-left
                  hover
                  must-sort
                  thead-class="table-light"
                  :sort-by="defaultSortBy"
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
                      @change="onChangeHeaderCheckbox(table, $event)"
                    >
                      <span class="visually-hidden-focusable">
                        {{ $t('global.table.selectAll') }}
                      </span>
                    </b-form-checkbox>
                  </template>
                  <template #cell(checkbox)="row">
                    <b-form-checkbox
                      v-model="row.rowSelected"
                      @change="toggleSelectRow(table, row.index)"
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
              </template>
            </b-tab>
          </b-tabs>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import type { BTableSortBy } from 'bootstrap-vue-next';
import PageTitle from '@/components/Global/PageTitle.vue';
import Search from '@/components/Global/Search.vue';
import TableFilter from '@/components/Global/TableFilter.vue';
import TableToolbar from '@/components/Global/TableToolbar.vue';
import TableToolbarExport from '@/components/Global/TableToolbarExport.vue';
import TableCellCount from '@/components/Global/TableCellCount.vue';

import { useTableSelection } from '@/components/Composables/useTableSelection';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';
import { useTableFilter } from '@/components/Composables/useTableFilter';
import { useDataFormatter } from '@/components/Composables/useDataFormatter';
import {
  useSensors,
  type ChassisSensorGroup,
} from '@/components/Composables/useSensors';
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

const table = ref<unknown>(null);
// The table sits inside a v-for'd tab pane, where a plain string ref would
// become an array, so bind it with a function ref instead.
function setTableRef(el: unknown) {
  table.value = el;
}
// bootstrap-vue-next types sortBy as { key, order }[], but passing a plain
// string array is the documented shorthand for sort-key-only. The double cast
// avoids a TS error without changing runtime behaviour.
const defaultSortBy = ['status'] as unknown as BTableSortBy[];
const searchFilter = ref('');
const searchTotalFilteredRows = ref(0);
const activeFilters = ref<unknown[]>([]);

// Active chassis tab tracked by integer index (matches v-model:index on BTabs).
// Using index avoids relying on dynamic DOM ids and matches the Network page
// pattern. chassisId lookup is still done in onTabChange for correctness.
const activeTabIndex = ref<number>(0);

// Active chassis id, kept in sync with activeTabIndex for sensor filtering.
const activeChassisId = ref<string | null>(null);

// Select the first chassis once data arrives, and fall back to it if the
// selected chassis disappears after a refetch.
watch(
  sensorsByChassis,
  (groups) => {
    if (!groups.length) return;
    if (!groups.some((g) => g.chassisId === activeChassisId.value)) {
      activeChassisId.value = groups[0].chassisId;
      activeTabIndex.value = 0;
    }
  },
  { immediate: true },
);

const hasMultipleChassis = computed(() => sensorsByChassis.value.length > 1);

// The table lives inside a tab pane, so there must always be at least one pane
// even while chassis data is still loading or no chassis has sensors.
// Use a sentinel id that cannot clash with a real Redfish chassis id.
const placeholderGroup: ChassisSensorGroup = {
  chassisId: '__placeholder__',
  chassisName: '',
  sensors: [],
  isLoading: false,
  isError: false,
  error: null,
};
const tabGroups = computed(() =>
  sensorsByChassis.value.length ? sensorsByChassis.value : [placeholderGroup],
);

// Only the active pane renders the table; with one chassis that is the only
// pane. This keeps a single table instance and a single table ref.
// The explicit tabGroups.value.length === 1 guard ensures that a single
// real group — not any future mix of groups — is what triggers the shortcut.
function isActiveGroup(group: ChassisSensorGroup) {
  if (tabGroups.value.length === 1) return true;
  return group.chassisId === activeChassisId.value;
}

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
function onTabChange(index: number) {
  const group = sensorsByChassis.value[index];
  if (!group || group.chassisId === activeChassisId.value) return;
  activeChassisId.value = group.chassisId;
  clearSelectedRows(table.value);
}

function onFilterChange({
  activeFilters: filters,
}: {
  activeFilters: unknown[];
}) {
  activeFilters.value = filters;
}

function onFiltered(filteredItems: unknown[]) {
  searchTotalFilteredRows.value = filteredItems.length;
}

function onChangeSearchInput(event: string) {
  searchFilter.value = event;
}

function onClearSearchInput() {
  searchFilter.value = '';
}

function exportFileNameByDate() {
  // Create export file name based on date.
  // Use toISOString() for both parts so the result is locale-independent
  // (e.g. "sensors_2024-06-01_14-30-00").
  const now = new Date();
  const date =
    now.toISOString().slice(0, 10) +
    '_' +
    now.toISOString().slice(11, 19).replace(/:/g, '-');
  return i18n.global.t('pageSensors.exportFilePrefix') + date;
}

function statusIcon(status: unknown) {
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

<style scoped>
:deep(.sensors-table-tabs .tab-content) {
  padding: 15px 15px 0 15px;
}

:deep(.sensors-table-single .tab-content) {
  padding: 0;
}
</style>
