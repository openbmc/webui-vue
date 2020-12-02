<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col>
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          :actions="batchActions"
          @clear-selected="clearSelectedRows($refs.table)"
          @batch-action="onBatchAction"
        >
        </table-toolbar>
        <b-table
          id="table-event-logs"
          ref="table"
          responsive="md"
          selectable
          no-select-on-click
          sort-icon-left
          hover
          no-sort-reset
          sort-desc
          show-empty
          sort-by="id"
          :fields="fields"
          :items="filteredLogs"
          :sort-compare="onSortCompare"
          :empty-text="$t('global.table.emptyMessage')"
          :empty-filtered-text="$t('global.table.emptySearchMessage')"
          :per-page="perPage"
          :current-page="currentPage"
          :filter="searchFilter"
          @filtered="onFiltered"
          @row-selected="onRowSelected($event, filteredLogs.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              data-test-id="eventLogs-checkbox-selectAll"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              @change="onChangeHeaderCheckbox($refs.table)"
            >
              <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
            </b-form-checkbox>
          </template>
          <template #cell(checkbox)="row">
            <b-form-checkbox
              v-model="row.rowSelected"
              :data-test-id="`eventLogs-checkbox-selectRow-${row.index}`"
              @change="toggleSelectRow($refs.table, row.index)"
            >
              <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
            </b-form-checkbox>
          </template>

          <!-- Actions column -->
          <template #cell(actions)="row">
            <table-row-action
              v-for="(action, index) in row.item.actions"
              :key="index"
              :value="action.value"
              :title="action.title"
              :row-data="row.item"
              :data-test-id="`eventLogs-button-deleteRow-${row.index}`"
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
          :total-rows="getTotalRowCount(filteredLogs.length)"
          aria-controls="table-event-logs"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { omit } from 'lodash';

import PageTitle from '@/components/Global/PageTitle';
import TableRowAction from '@/components/Global/TableRowAction';
import TableToolbar from '@/components/Global/TableToolbar';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import TableFilterMixin from '@/components/Mixins/TableFilterMixin';
import BVPaginationMixin, {
  currentPage,
  perPage,
  itemsPerPageOptions,
} from '@/components/Mixins/BVPaginationMixin';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';

export default {
  components: {
    PageTitle,
    TableRowAction,
    TableToolbar,
  },
  mixins: [
    BVPaginationMixin,
    BVTableSelectableMixin,
    BVToastMixin,
    LoadingBarMixin,
    TableFilterMixin,
    TableDataFormatterMixin,
    TableSortMixin,
    SearchFilterMixin,
  ],
  beforeRouteLeave(to, from, next) {
    // Hide loader if the user navigates to another page
    // before request is fulfilled.
    this.hideLoader();
    next();
  },
  data() {
    return {
      fields: [
        {
          key: 'checkbox',
          sortable: false,
        },
        {
          key: 'clientID',
          label: this.$t('clientSessions.table.clientID'),
        },
        {
          key: 'ipAddress',
          label: this.$t('clientSessions.table.ipAddress'),
          tdClass: 'text-nowrap',
        },
        {
          key: 'actions',
          sortable: false,
          label: this.$t('clientSessions.table.actions'),
          tdClass: 'text-nowrap',
        },
      ],
      activeFilters: [],
      batchActions: [
        {
          value: 'remove',
          label: this.$t('global.action.removeConnection'),
        },
      ],
      currentPage: currentPage,
      filterStartDate: null,
      filterEndDate: null,
      itemsPerPageOptions: itemsPerPageOptions,
      perPage: perPage,
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
    };
  },
  computed: {
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.filteredLogs.length;
    },
    allConnections() {
      return this.$store.getters['clientSessions/allConnections'].map(
        (event) => {
          return {
            ...event,
            actions: [
              {
                value: 'remove',
                title: this.$t('global.action.removeConnection'),
              },
            ],
          };
        }
      );
    },
    batchExportData() {
      return this.selectedRows.map((row) => omit(row, 'actions'));
    },
    filteredLogsByDate() {
      return this.getFilteredTableDataByDate(
        this.allConnections,
        this.filterStartDate,
        this.filterEndDate
      );
    },
    filteredLogs() {
      return this.getFilteredTableData(
        this.filteredLogsByDate,
        this.activeFilters
      );
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('clientSessions/getClinetSessionsData')
      .finally(() => this.endLoader());
  },
  methods: {
    // deleteLogs(uris) {
    //   this.$store
    //     .dispatch('eventLog/deleteEventLogs', uris)
    //     .then((messages) => {
    //       messages.forEach(({ type, message }) => {
    //         if (type === 'success') {
    //           this.successToast(message);
    //         } else if (type === 'error') {
    //           this.errorToast(message);
    //         }
    //       });
    //     });
    // },
    onSortCompare(a, b, key) {
      if (key === 'severity') {
        return this.sortStatus(a, b, key);
      }
    },
    onTableRowAction(action, { uri }) {
      if (action === 'remove') {
        this.$bvModal
          .msgBoxConfirm(this.$tc('pageEventLogs.modal.deleteMessage'), {
            title: this.$tc('pageEventLogs.modal.deleteTitle'),
            okTitle: this.$t('global.action.delete'),
          })
          .then((deleteConfirmed) => {
            if (deleteConfirmed) this.deleteLogs([uri]);
          });
      }
    },
    onBatchAction(action) {
      if (action === 'delete') {
        const uris = this.selectedRows.map((row) => row.uri);
        this.$bvModal
          .msgBoxConfirm(
            this.$tc(
              'pageEventLogs.modal.deleteMessage',
              this.selectedRows.length
            ),
            {
              title: this.$tc(
                'pageEventLogs.modal.deleteTitle',
                this.selectedRows.length
              ),
              okTitle: this.$t('global.action.delete'),
            }
          )
          .then((deleteConfirmed) => {
            if (deleteConfirmed) {
              if (this.selectedRows.length === this.allConnections.length) {
                this.$store
                  .dispatch(
                    'eventLog/deleteAllEventLogs',
                    this.selectedRows.length
                  )
                  .then((message) => this.successToast(message))
                  .catch(({ message }) => this.errorToast(message));
              } else {
                this.deleteLogs(uris);
              }
            }
          });
      }
    },
    onChangeDateTimeFilter({ fromDate, toDate }) {
      this.filterStartDate = fromDate;
      this.filterEndDate = toDate;
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
  },
};
</script>
