<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col sm="6" lg="5" xl="4">
        <page-section :section-title="$t('pageDumps.initiateDump')">
          <dumps-form />
        </page-section>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="10">
        <page-section :section-title="$t('pageDumps.dumpsAvailableOnBmc')">
          <b-row class="align-items-start">
            <b-col sm="8" xl="6" class="d-sm-flex align-items-end">
              <search
                :placeholder="$t('pageDumps.table.searchDumps')"
                @change-search="onChangeSearchInput"
                @clear-search="onClearSearchInput"
              />
              <div class="ml-sm-4">
                <table-cell-count
                  :filtered-items-count="filteredItemCount"
                  :total-number-of-cells="tableItems.length"
                ></table-cell-count>
              </div>
            </b-col>
            <b-col sm="8" md="7" xl="6">
              <table-date-filter @change="onChangeDateTimeFilter" />
            </b-col>
            <b-col class="text-right">
              <table-filter
                :filters="tableFilters"
                @filter-change="onFilterChange"
              />
            </b-col>
          </b-row>

          <table-toolbar
            :selected-items-count="selectedRows.length"
            :actions="batchActions"
            @clear-selected="clearSelectedRows($refs.table)"
            @batch-action="onTableBatchAction"
          />
          <b-table
            ref="table"
            show-empty
            hover
            sort-icon-left
            no-sort-reset
            sort-desc
            selectable
            no-select-on-click
            responsive="md"
            sort-by="dateTime"
            :fields="fields"
            :items="filteredLogs"
            :empty-text="$t('global.table.emptyMessage')"
            :empty-filtered-text="$t('global.table.emptySearchMessage')"
            :filter="searchFilter"
            @filtered="onChangeSearchFilter"
            @row-selected="onRowSelected($event, filteredLogs.length)"
          >
            <!-- Checkbox column -->
            <template #head(checkbox)>
              <b-form-checkbox
                v-model="tableHeaderCheckboxModel"
                :indeterminate="tableHeaderCheckboxIndeterminate"
                @change="onChangeHeaderCheckbox($refs.table)"
              >
                <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
              </b-form-checkbox>
            </template>
            <template #cell(checkbox)="row">
              <b-form-checkbox
                v-model="row.rowSelected"
                @change="toggleSelectRow($refs.table, row.index)"
              >
                <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
              </b-form-checkbox>
            </template>

            <!-- Date and Time column -->
            <template #cell(dateTime)="{ value }">
              <p class="mb-0">{{ value | formatDate }}</p>
              <p class="mb-0">{{ value | formatTime }}</p>
            </template>

            <!-- Size column -->
            <template #cell(size)="{ value }">
              {{ convertBytesToMegabytes(value) }} MB
            </template>

            <!-- Actions column -->
            <template #cell(actions)="row">
              <table-row-action
                v-for="(action, index) in row.item.actions"
                :key="index"
                :value="action.value"
                :title="action.title"
                :download-location="row.item.data"
                :export-name="`${row.item.dumpType} ${row.item.id}`"
                @click-table-action="onTableRowAction($event, row.item)"
              >
                <template #icon>
                  <icon-download v-if="action.value === 'download'" />
                  <icon-delete v-if="action.value === 'delete'" />
                </template>
              </table-row-action>
            </template>
          </b-table>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import IconDelete from '@carbon/icons-vue/es/trash-can/20';
import IconDownload from '@carbon/icons-vue/es/download/20';

import DumpsForm from './DumpsForm';
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import Search from '@/components/Global/Search';
import TableCellCount from '@/components/Global/TableCellCount';
import TableDateFilter from '@/components/Global/TableDateFilter';
import TableRowAction from '@/components/Global/TableRowAction';
import TableToolbar from '@/components/Global/TableToolbar';

import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import TableFilterMixin from '@/components/Mixins/TableFilterMixin';
import TableFilter from '@/components/Global/TableFilter';
export default {
  components: {
    DumpsForm,
    IconDelete,
    IconDownload,
    PageSection,
    PageTitle,
    Search,
    TableCellCount,
    TableDateFilter,
    TableRowAction,
    TableToolbar,
    TableFilter,
  },
  mixins: [
    BVTableSelectableMixin,
    BVToastMixin,
    LoadingBarMixin,
    SearchFilterMixin,
    TableFilterMixin,
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
          key: 'dateTime',
          label: this.$t('pageDumps.table.dateAndTime'),
          sortable: true,
        },
        {
          key: 'dumpType',
          label: this.$t('pageDumps.table.dumpType'),
          sortable: true,
        },
        {
          key: 'id',
          label: this.$t('pageDumps.table.id'),
          sortable: true,
        },
        {
          key: 'size',
          label: this.$t('pageDumps.table.size'),
          sortable: true,
        },
        {
          key: 'actions',
          sortable: false,
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
      batchActions: [
        {
          value: 'delete',
          label: this.$t('global.action.delete'),
        },
      ],
      tableFilters: [
        {
          key: 'dumpType',
          label: this.$t('pageDumps.table.dumpType'),
          values: [
            'BMC Dump Entry',
            'Hostboot Dump Entry',
            'Resource Dump Entry',
            'System Dump Entry',
          ],
        },
      ],
      activeFilters: [],
      filterEndDate: null,
      filterStartDate: null,
      searchFilter,
      searchFilteredItemsCount: 0,
      selectedRows,
      tableHeaderCheckboxIndeterminate,
      tableHeaderCheckboxModel,
    };
  },
  computed: {
    dumps() {
      return this.$store.getters['dumps/allDumps'];
    },
    tableItems() {
      return this.dumps.map((item) => {
        return {
          ...item,
          actions: [
            {
              value: 'download',
              title: this.$t('global.action.download'),
            },
            {
              value: 'delete',
              title: this.$t('global.action.delete'),
            },
          ],
        };
      });
    },
    filteredTableItems() {
      return this.getFilteredTableDataByDate(
        this.tableItems,
        this.filterStartDate,
        this.filterEndDate,
        'dateTime'
      );
    },
    filteredLogs() {
      return this.getFilteredTableData(
        this.filteredTableItems,
        this.activeFilters
      );
    },
    filteredItemCount() {
      return this.searchFilter
        ? this.searchFilteredItemsCount
        : this.filteredLogs.length;
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('dumps/getAllDumps').finally(() => this.endLoader());
  },
  methods: {
    convertBytesToMegabytes(bytes) {
      return parseFloat((bytes / 1000000).toFixed(3));
    },
    onChangeSearchFilter(items) {
      this.searchFilteredItemsCount = items.length;
    },
    onChangeDateTimeFilter({ fromDate, toDate }) {
      this.filterStartDate = fromDate;
      this.filterEndDate = toDate;
    },
    onTableRowAction(action, dump) {
      if (action === 'delete') {
        this.$bvModal
          .msgBoxConfirm(this.$tc('pageDumps.modal.deleteDumpConfirmation'), {
            title: this.$tc('pageDumps.modal.deleteDump'),
            okTitle: this.$tc('pageDumps.modal.deleteDump'),
            cancelTitle: this.$t('global.action.cancel'),
          })
          .then((deleteConfrimed) => {
            if (deleteConfrimed) {
              this.$store
                .dispatch('dumps/deleteDumps', [dump])
                .then((messages) => {
                  messages.forEach(({ type, message }) => {
                    if (type === 'success') {
                      this.successToast(message);
                    } else if (type === 'error') {
                      this.errorToast(message);
                    }
                  });
                });
            }
          });
      }
    },
    onTableBatchAction(action) {
      if (action === 'delete') {
        this.$bvModal
          .msgBoxConfirm(
            this.$tc(
              'pageDumps.modal.deleteDumpConfirmation',
              this.selectedRows.length
            ),
            {
              title: this.$tc(
                'pageDumps.modal.deleteDump',
                this.selectedRows.length
              ),
              okTitle: this.$tc(
                'pageDumps.modal.deleteDump',
                this.selectedRows.length
              ),
              cancelTitle: this.$t('global.action.cancel'),
            }
          )
          .then((deleteConfrimed) => {
            if (deleteConfrimed) {
              if (this.selectedRows.length === this.dumps.length) {
                this.$store
                  .dispatch('dumps/deleteAllDumps')
                  .then((success) => this.successToast(success))
                  .catch(({ message }) => this.errorToast(message));
              } else {
                this.$store
                  .dispatch('dumps/deleteDumps', this.selectedRows)
                  .then((messages) => {
                    messages.forEach(({ type, message }) => {
                      if (type === 'success') {
                        this.successToast(message);
                      } else if (type === 'error') {
                        this.errorToast(message);
                      }
                    });
                  });
              }
            }
          });
      }
    },
    onFilterChange({ activeFilters }) {
      this.activeFilters = activeFilters;
    },
  },
};
</script>
