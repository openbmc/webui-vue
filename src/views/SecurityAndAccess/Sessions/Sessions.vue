<template>
  <b-container fluid="xl">
    <page-title />
    <b-row class="align-items-end">
      <b-col sm="6" md="5" xl="4">
        <search
          :placeholder="$t('pageSessions.table.searchSessions')"
          data-test-id="sessions-input-searchSessions"
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
      </b-col>
      <b-col sm="3" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="tableItems.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <table-toolbar
          ref="toolbar"
          :selected-items-count="
            Array.isArray(selectedRows) ? selectedRows.length : 0
          "
          :actions="batchActions"
          @clear-selected="clearSelectedRows(table)"
          @batch-action="onBatchAction"
        >
        </table-toolbar>
        <b-table
          id="table-session-logs"
          ref="table"
          responsive="md"
          selectable
          no-select-on-click
          hover
          show-empty
          thead-class="table-light"
          :sort-by="sortBy"
          :busy="isBusy"
          :fields="fields"
          :items="tableItems"
          :filter="searchFilter"
          :empty-text="$t('global.table.emptyMessage')"
          :per-page="perPage"
          :current-page="currentPage"
          :tbody-tr-class="rowClass"
          @filtered="onFiltered"
          @row-selected="onRowSelected(table)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              data-test-id="sessions-checkbox-selectAll"
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
              :disabled="isCurrentSession(row.item)"
              :data-test-id="`sessions-checkbox-selectRow-${row.index}`"
              @change="toggleSelectRow(table, row.index)"
            >
              <span class="visually-hidden-focusable">
                {{ $t('global.table.selectItem') }}
              </span>
            </b-form-checkbox>
          </template>

          <!-- Session ID column -->
          <template #cell(Id)="row">
            <span :class="{ 'fw-bold text-success': isCurrentSession(row.item) }">
              {{ row.item.Id }}
              <span v-if="isCurrentSession(row.item)" class="small">
                ({{ $t('pageSessions.currentSession') }})
              </span>
            </span>
          </template>

          <!-- Actions column -->
          <template #cell(actions)="row">
            <table-row-action
              v-for="(action, index) in row.item.actions"
              :key="index"
              :value="action.value"
              :title="action.title"
              :enabled="!isCurrentSession(row.item)"
              :row-data="row.item"
              :btn-icon-only="false"
              :data-test-id="`sessions-button-disconnect-${row.index}`"
              @click-table-action="onTableRowAction($event, row.item)"
            ></table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>

    <!-- Table pagination -->
    <b-row>
      <b-col sm="6">
        <b-form-group
          class="table-pagination-select"
          :label="$t('global.table.itemsPerPage')"
          label-for="pagination-items-per-page"
        >
          <b-form-select
            id="pagination-items-per-page"
            v-model="perPage"
            :options="itemsPerPageOptions"
          />
        </b-form-group>
      </b-col>
      <b-col sm="6">
        <b-pagination
          v-model="currentPage"
          first-number
          last-number
          :per-page="perPage"
          :total-rows="getTotalRowCount(filteredRows)"
          aria-controls="table-session-logs"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, getCurrentInstance } from 'vue';
import { useStore } from 'vuex';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import PageTitle from '@/components/Global/PageTitle';
import Search from '@/components/Global/Search';
import TableCellCount from '@/components/Global/TableCellCount';
import TableRowAction from '@/components/Global/TableRowAction';
import TableToolbar from '@/components/Global/TableToolbar';

import {
  useSessions,
  useDisconnectSession,
} from '@/components/Composables/useSessions';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';
import { useToast } from '@/components/Composables/useToast';
import { useTableSelection } from '@/components/Composables/useTableSelection';
import { usePagination } from '@/components/Composables/usePagination';
import i18n from '@/i18n';

const { proxy } = getCurrentInstance();
const store = useStore();
const router = useRouter();
const { startLoader, endLoader, hideLoader } = useLoadingBar();
const { successToast, errorToast } = useToast();
const {
  isLoading: isSessionsLoading,
  isFetching: isSessionsFetching,
  data: sessions,
} = useSessions();
const { mutate: disconnectSession } = useDisconnectSession();

const { currentPage, perPage, itemsPerPageOptions, getTotalRowCount } =
  usePagination();
const {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
  onRowSelected,
  onChangeHeaderCheckbox,
  toggleSelectRow,
  clearSelectedRows,
} = useTableSelection();

const searchFilter = ref('');
const searchTotalFilteredRows = ref(0);
const table = ref(null);

const sortBy = ['Id'];

const currentSessionUri = computed(
  () => store.state.authentication.sessionURI,
);

const fields = [
  {
    key: 'checkbox',
    class: 'text-center',
  },
  {
    key: 'Id',
    label: i18n.global.t('pageSessions.table.sessionID'),
    class: 'text-center',
    sortable: true,
  },
  {
    key: 'Context',
    label: i18n.global.t('pageSessions.table.context'),
    class: 'text-center',
    sortable: true,
  },
  {
    key: 'UserName',
    label: i18n.global.t('pageSessions.table.username'),
    class: 'text-center',
    sortable: true,
  },
  {
    key: 'ClientOriginIPAddress',
    label: i18n.global.t('pageSessions.table.ipAddress'),
    class: 'text-center',
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    class: 'text-center',
  },
];

const batchActions = [
  {
    value: 'disconnect',
    label: i18n.global.t('pageSessions.action.disconnect'),
  },
];

const isBusy = computed(() => isSessionsLoading.value);

const tableItems = computed(() => {
  if (!sessions.value) return [];
  return sessions.value.map((session) => ({
    ...session,
    Context: session.Context || '-',
    ClientOriginIPAddress:
      session.ClientOriginIPAddress ||
      session.Oem?.OpenBMC?.ClientOriginIPAddress ||
      '',
    actions: [
      {
        value: 'disconnect',
        title: isCurrentSession(session)
          ? i18n.global.t('pageSessions.currentSession')
          : i18n.global.t('pageSessions.action.disconnect'),
      },
    ],
  }));
});

const filteredRows = computed(() => {
  return searchFilter.value
    ? searchTotalFilteredRows.value
    : tableItems.value.length;
});

function isCurrentSession(session) {
  const uri = session?.['@odata']?.id || session?.['@odata.id'];
  return !!uri && uri === currentSessionUri.value;
}

function rowClass(item, type) {
  if (type !== 'row' || !item) return '';
  return isCurrentSession(item) ? 'table-success' : '';
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

function disconnectSessions(uris) {
  disconnectSession(
    { uris, currentSessionUri: currentSessionUri.value },
    {
      onSuccess: ({ successCount, errorCount, currentDisconnected }) => {
        if (successCount) {
          successToast(
            i18n.global.t('pageSessions.toast.successDelete', successCount),
          );
        }
        if (errorCount) {
          errorToast(
            i18n.global.t('pageSessions.toast.errorDelete', errorCount),
          );
        }
        clearSelectedRows(table.value);

        // Disconnecting our own session invalidates the token; sign out
        // cleanly and route to login instead of waiting for the next request
        // to 401. Toasts are app-level, so the result is still visible there.
        if (currentDisconnected) {
          store.commit('authentication/logout');
          router.push('/login');
        }
      },
      onError: (_error, { uris: failedUris }) => {
        errorToast(
          i18n.global.t('pageSessions.toast.errorDelete', failedUris.length),
        );
      },
    },
  );
}

function confirmDisconnect(count, uris) {
  const includesCurrent = uris.some((uri) => uri === currentSessionUri.value);
  let message = i18n.global.t('pageSessions.modal.disconnectMessage', count);
  if (includesCurrent) {
    message = `${message}\n${i18n.global.t('pageSessions.modal.includesCurrentSession')}`;
  }

  proxy
    .$confirm(message, {
      title: i18n.global.t('pageSessions.modal.disconnectTitle', count),
      okTitle: i18n.global.t('pageSessions.action.disconnect'),
      cancelTitle: i18n.global.t('global.action.cancel'),
      autoFocusButton: 'ok',
    })
    .then((confirmed) => {
      if (confirmed) {
        disconnectSessions(uris.filter(Boolean));
      }
    });
}

function onTableRowAction(action, row) {
  if (action !== 'disconnect' || isCurrentSession(row)) return;
  const uri = row['@odata']?.id || row['@odata.id'];
  confirmDisconnect(1, [uri]);
}

function onBatchAction(action) {
  if (action !== 'disconnect') return;

  const uris = selectedRows.value
    .map((row) => row['@odata']?.id || row['@odata.id'])
    .filter(Boolean);
  if (!uris.length) return;

  confirmDisconnect(uris.length, uris);
}

// Watch loading state and control loading bar
watch(
  () => isSessionsLoading.value,
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

<style lang="scss">
#table-session-logs {
  td .btn-link {
    width: auto !important;
  }
}
</style>
