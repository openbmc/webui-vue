<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageClientSessions.description')" />
    <b-row>
      <b-col sm="8" md="6" xl="12">
        <page-section
          :section-title="
            $t('pageClientSessions.sessionsConnected', {
              count: allConnections.length,
            })
          "
        >
          {{ $t('pageClientSessions.sessionsConnectedDesc') }}
        </page-section>
      </b-col>
    </b-row>
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
          id="table-session-logs"
          ref="table"
          responsive="md"
          selectable
          no-select-on-click
          hover
          show-empty
          sort-by="clientID"
          :fields="fields"
          :items="allConnections"
          :empty-text="$t('global.table.emptyMessage')"
          :per-page="perPage"
          :current-page="currentPage"
          @row-selected="onRowSelected($event, allConnections.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              data-test-id="sessionLogs-checkbox-selectAll"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              @change="onChangeHeaderCheckbox($refs.table)"
            >
              <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
            </b-form-checkbox>
          </template>
          <template #cell(checkbox)="row">
            <b-form-checkbox
              v-model="row.rowSelected"
              :data-test-id="`sessionLogs-checkbox-selectRow-${row.index}`"
              @change="toggleSelectRow($refs.table, row.index)"
            >
              <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
            </b-form-checkbox>
          </template>

          <!-- Actions column -->
          <template #cell(actions)="row" class="ml-3">
            <table-row-action
              v-for="(action, index) in row.item.actions"
              :key="index"
              :value="action.value"
              :title="action.title"
              :row-data="row.item"
              :data-test-id="`sessionLogs-button-deleteRow-${row.index}`"
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
          :total-rows="getTotalRowCount(allConnections.length)"
          aria-controls="table-session-logs"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import TableRowAction from '@/components/Global/TableRowAction';
import TableToolbar from '@/components/Global/TableToolbar';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
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
import PageSection from '@/components/Global/PageSection';

export default {
  components: {
    PageTitle,
    TableRowAction,
    TableToolbar,
    PageSection,
  },
  mixins: [
    BVPaginationMixin,
    BVTableSelectableMixin,
    BVToastMixin,
    LoadingBarMixin,
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
        },
        {
          key: 'clientID',
          label: this.$t('pageClientSessions.table.clientID'),
          tdClass: 'text-nowrap',
        },
        {
          key: 'username',
          label: this.$t('pageClientSessions.table.username'),
          tdClass: 'text-nowrap',
        },
        {
          key: 'ipAddress',
          label: this.$t('pageClientSessions.table.ipAddress'),
          tdClass: 'text-nowrap',
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-nowrap',
        },
      ],
      batchActions: [
        {
          value: 'disconnect',
          label: this.$t('pageClientSessions.action.disconnect'),
        },
      ],
      currentPage: currentPage,
      itemsPerPageOptions: itemsPerPageOptions,
      perPage: perPage,
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
    };
  },
  computed: {
    allConnections() {
      return this.$store.getters['clientSessions/allConnections'].map(
        (session) => {
          return {
            ...session,
            actions: [
              {
                value: 'disconnect',
                title: this.$t('pageClientSessions.action.disconnect'),
              },
            ],
          };
        }
      );
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('clientSessions/getClientSessionsData')
      .finally(() => this.endLoader());
  },
  methods: {
    disconnectSessions(uris) {
      this.$store
        .dispatch('clientSessions/disconnectSessions', uris)
        .then((messages) => {
          messages.forEach(({ type, message }) => {
            if (type === 'success') {
              this.successToast(message);
            } else if (type === 'error') {
              this.errorToast(message);
            }
          });
        });
    },
    onTableRowAction(action, { uri }) {
      if (action === 'disconnect') {
        this.$bvModal
          .msgBoxConfirm(
            this.$tc('pageClientSessions.modal.disconnectMessage'),
            {
              title: this.$tc('pageClientSessions.modal.disconnectTitle'),
              okTitle: this.$t('pageClientSessions.action.disconnect'),
            }
          )
          .then((deleteConfirmed) => {
            if (deleteConfirmed) this.disconnectSessions([uri]);
          });
      }
    },
    onBatchAction(action) {
      if (action === 'disconnect') {
        const uris = this.selectedRows.map((row) => row.uri);
        this.$bvModal
          .msgBoxConfirm(
            this.$tc(
              'pageClientSessions.modal.disconnectMessage',
              this.selectedRows.length
            ),
            {
              title: this.$tc(
                'pageClientSessions.modal.disconnectTitle',
                this.selectedRows.length
              ),
              okTitle: this.$t('pageClientSessions.action.disconnect'),
            }
          )
          .then((deleteConfirmed) => {
            if (deleteConfirmed) {
              this.disconnectSessions(uris);
            }
          });
      }
    },
  },
};
</script>
<style lang="scss">
#table-session-logs {
  td .btn-link {
    width: auto !important;
  }
}
</style>
