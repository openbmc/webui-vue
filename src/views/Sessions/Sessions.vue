<template>
  <BContainer fluid="xl">
    <page-title />
    <BRow class="align-items-end">
      <BCol sm="6" md="5" xl="4">
        <search
          :placeholder="t('pageSessions.table.searchSessions')"
          data-test-id="sessions-input-searchSessions"
          @change-search="onChangeSearch"
          @clear-search="onClearSearch"
        />
      </BCol>
      <BCol sm="3" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="allConnections.length"
        ></table-cell-count>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          :actions="batchActions"
          @clear-selected="clearSelectedRows(tableRef)"
          @batch-action="onBatchAction"
        >
        </table-toolbar>
        <BTable
          id="table-session-logs"
          ref="tableRef"
          responsive="md"
          hover
          selectable
          show-empty
          sort-by="sessionID"
          :busy="isBusy"
          :fields="fields"
          :items="allConnections"
          :filter="searchFilterInput"
          :empty-text="t('global.table.emptyMessage')"
          :per-page="itemPerPage"
          :current-page="currentPageNo"
          @filtered="onFiltered"
          @row-selected="onRowSelected($event, allConnections.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <BFormCheckbox
              v-model="tableHeaderCheckbox"
              data-test-id="sessions-checkbox-selectAll"
              :indeterminate="tableHeaderCheckboxIndeterminated"
              @change="onChangeHeaderCheckbox(tableRef, tableHeaderCheckbox)"
            >
            </BFormCheckbox>
          </template>
          <template #cell(checkbox)="row">
            <BFormCheckbox
              v-model="row.rowSelected"
              :data-test-id="`sessions-checkbox-selectRow-${row.index}`"
              @change="toggleSelectRow(tableRef, row.index)"
            >
            </BFormCheckbox>
          </template>

          <!-- Actions column -->
          <template #cell(actions)="row">
            <table-row-action
              v-for="(action, index) in row.item.actions"
              :key="index"
              :value="action.value"
              :title="action.title"
              :row-data="row.item"
              :btn-icon-only="false"
              :data-test-id="`sessions-button-disconnect-${row.index}`"
              @click-table-action="onTableRowAction($event, row.item)"
            >
            </table-row-action>
            <BModal
              id="my-modal"
              v-model="confirmBox"
              :title="t('pageSessions.modal.disconnectTitle')"
              :okTitle="t('pageSessions.action.disconnect')"
              hideHeaderClose="true"
              @ok="okClick($event, row.item)"
            >
              {{ t('pageSessions.modal.disconnectMessage') }}
            </BModal>
          </template>
        </BTable>
      </BCol>
    </BRow>
    <!-- Table pagination -->
    <BRow>
      <BCol sm="6">
        <BFormGroup
          class="table-pagination-select"
          :label="t('global.table.itemsPerPage')"
          label-for="pagination-items-per-page"
        >
          <BFormSelect
            id="pagination-items-per-page"
            v-model="itemPerPage"
            :options="itemsPerPageOptions"
          />
        </BFormGroup>
      </BCol>
      <BCol sm="6">
        <BPagination
          v-model="currentPageNo"
          class="justify-content-end"
          first-number
          last-number
          :per-page="itemPerPage"
          :total-rows="getTotalRowCount(filteredRows)"
          aria-controls="table-session-logs"
        />
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup>
import PageTitle from '@/components/Global/PageTitle.vue';
import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import TableRowAction from '@/components/Global/TableRowAction.vue';
import SessionsStore from '../../store/modules/SecurityAndAccess/SessionsStore';
import SystemStore from '../../store/modules/HardwareStatus/SystemStore';
import usePaginationComposable from '@/components/Composables/usePaginationComposable';
import useTableSelectableComposable from '@/components/Composables/useTableSelectableComposable';
import TableToolbar from '@/components/Global/TableToolbar.vue';
import Search from '@/components/Global/Search.vue';
import TableCellCount from '@/components/Global/TableCellCount.vue';

const { currentPage, perPage, itemsPerPageOptions, getTotalRowCount } =
  usePaginationComposable();
const {
  clearSelectedRows,
  toggleSelectRow,
  onRowSelected,
  onChangeHeaderCheckbox,
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} = useTableSelectableComposable();
const openModal = ref(false);
const confirmBox = ref(false);
const router = useRouter();
const sessionStore = SessionsStore();
const systemStore = SystemStore();
systemStore.getSystem();
const { t } = useI18n();
const isBusy = ref(true);
const searchFilterInput = ref('');
const searchTotalFilteredRows = ref(0);
const itemPerPage = ref(perPage);
const currentPageNo = ref(currentPage);
const tableHeaderCheckbox = ref(tableHeaderCheckboxModel);
const tableHeaderCheckboxIndeterminated = ref(tableHeaderCheckboxIndeterminate);
const tableRef = ref(null);
const fields = ref([
  {
    key: 'checkbox',
    class: 'text-center',
  },
  {
    key: 'sessionID',
    label: i18n.global.t('pageSessions.table.sessionID'),
    class: 'text-center',
  },
  {
    key: 'context',
    label: i18n.global.t('pageSessions.table.context'),
    class: 'text-center',
  },
  {
    key: 'username',
    label: i18n.global.t('pageSessions.table.username'),
    class: 'text-center',
  },
  {
    key: 'ipAddress',
    label: i18n.global.t('pageSessions.table.ipAddress'),
    class: 'text-center',
  },
  {
    key: 'actions',
    label: '',
    class: 'text-center',
  },
]);
const batchActions = ref([
  {
    value: 'disconnect',
    label: i18n.global.t('pageSessions.action.disconnect'),
  },
]);
sessionStore.getSessionsData().finally(() => {
  isBusy.value = false;
});
// router.beforeRouteLeave((to, from, next) => {
//   // Hide loader if the user navigates to another page
//   // before request is fulfilled.
//   this.hideLoader();
//   next();
// });
const allConnections = computed(() => {
  if (sessionStore.allConnections) {
    return sessionStore.allConnections.map((session) => {
      return {
        ...session,
        actions: [
          {
            value: 'disconnect',
            title: i18n.global.t('pageSessions.action.disconnect'),
          },
        ],
      };
    });
  }
});
const filteredRows = computed(() => {
  return searchFilterInput.value
    ? searchTotalFilteredRows.value
    : allConnections.value.length;
});
const onFiltered = (filteredItems) => {
  searchTotalFilteredRows.value = filteredItems.length;
};
const onChangeSearch = (event) => {
  searchFilterInput.value = event;
};
const onClearSearch = (event) => {
  searchFilterInput.value = '';
};
const okClick = (action, { uri }) => {
  disconnectSessions([uri]);
  confirmBox.value = false;
};
const onTableRowAction = (action, { uri }) => {
  if (action === 'disconnect') {
    // disconnectSessions([uri]);
    confirmBox.value = true;
  }
};
const disconnectSessions = (uris) => {
  sessionStore.disconnectSessions(uris).then((messages) => {
    messages.forEach(({ type, message }) => {
      if (type === 'success') {
        console.log(message);
      } else if (type === 'error') {
        console.log(message);
      }
    });
  });
};
const onChangeHeaderCheck = (tab, checkbox) => {
  if (tableRef.value) {
    tableRef.value.selectAllRows();
  }
};
</script>
<style lang="scss">
#table-session-logs {
  td .btn-link {
    width: auto !important;
  }
}
</style>
