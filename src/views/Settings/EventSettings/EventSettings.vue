<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageEventSettings.pageDescription')" />
    <b-row>
      <b-col xl="10" class="text-right">
        <b-button variant="link" @click="sentTestMessage">
          <icon-email />
          {{ $t('pageEventSettings.sentTestMessage') }}
        </b-button>
        <b-button
          variant="primary"
          data-test-id="eventSettings-init-modalSubscription"
          @click="initModalSubscription"
        >
          <icon-add />
          {{ $t('pageEventSettings.addSubscription') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="10" :title="$t('pageEventSettings.subscriptions')">
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          :actions="tableToolbarActions"
          @clear-selected="clearSelectedRows($refs.table)"
          @batch-action="onBatchAction"
        />
        <b-table
          ref="table"
          responsive="md"
          selectable
          show-empty
          no-select-on-click
          hover
          :items="tableItems"
          :fields="fields"
          :empty-text="$t('global.table.emptyMessage')"
          @row-selected="onRowSelected($event, tableItems.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              data-test-id="eventSettings-checkbox-tableHeaderCheckbox"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              @change="onChangeHeaderCheckbox($refs.table)"
            />
          </template>
          <template #cell(checkbox)="row">
            <b-form-checkbox
              v-model="row.rowSelected"
              data-test-id="localUserManagement-checkbox-toggleSelectRow"
              @change="toggleSelectRow($refs.table, row.index)"
            />
          </template>

          <!-- table actions column -->
          <template #cell(actions)="{ item }">
            <table-row-action
              v-for="(action, index) in item.actions"
              :key="index"
              :value="action.value"
              :enabled="action.enabled"
              :title="action.title"
              @click-table-action="onTableRowAction($event, item)"
            >
              <template #icon>
                <icon-edit
                  v-if="action.value === 'edit'"
                  :data-test-id="`eventSettings-tableRowAction-edit-${index}`"
                />
                <icon-trashcan
                  v-if="action.value === 'delete'"
                  :data-test-id="`eventSettings-tableRowAction-delete-${index}`"
                />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <modal-subscription />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import IconEmail from '@carbon/icons-vue/es/email/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import SearchFilterMixin from '@/components/Mixins/SearchFilterMixin';
import TableRowExpandMixin from '@/components/Mixins/TableRowExpandMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import TableToolbar from '@/components/Global/TableToolbar';
import TableRowAction from '@/components/Global/TableRowAction';
import ModalSubscription from './ModalSubscription';

export default {
  components: {
    PageTitle,
    IconTrashcan,
    IconAdd,
    ModalSubscription,
    TableRowAction,
    TableToolbar,
    IconEmail,
  },
  mixins: [
    BVTableSelectableMixin,
    BVToastMixin,
    VuelidateMixin,
    LoadingBarMixin,
    SearchFilterMixin,
    TableRowExpandMixin,
  ],
  data() {
    return {
      fields: [
        {
          key: 'checkbox',
        },
        {
          key: 'id',
          label: this.$t('pageEventSettings.table.id'),
          formatter: this.tableFormatter,
          sortable: true,
        },
        {
          key: 'protocol',
          label: this.$t('pageEventSettings.table.protocol'),
          formatter: this.tableFormatter,
        },
        {
          key: 'destination',
          label: this.$t('pageEventSettings.table.destination'),
          formatter: this.tableFormatter,
        },
        {
          key: 'lowestSeverity',
          label: this.$t('pageEventSettings.table.lowestSeverity'),
          formatter: this.tableFormatter,
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
      tableToolbarActions: [
        {
          value: 'delete',
          label: this.$t('global.action.delete'),
        },
      ],
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
    };
  },
  computed: {
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.disks.length;
    },
    allSubscriptions() {
      return this.$store.getters['eventSettings/subscriptions'];
    },
    tableItems() {
      return this.allSubscriptions.map((subscription) => {
        const data = {
          id: subscription.id,
          protocol: subscription.protocol,
          destination: subscription.destination,
          lowestSeverity: subscription.lowestSeverity,
          name: subscription.name,
          actions: [
            {
              value: 'delete',
              enabled: true,
              title: this.$tc('pageEventSettings.deleteSubscription'),
            },
          ],
          ...subscription,
        };
        return data;
      });
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('eventSettings/getSubscriptions')
      .finally(() => this.endLoader());
  },
  methods: {
    initModalSubscription() {
      this.$bvModal.show('modal-subscription');
    },
    initModalDelete(subscription) {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageEventSettings.modal.deleteConfirmMessage', {
            subscription: subscription.id,
          }),
          {
            title: this.$tc('pageEventSettings.deleteSubscription'),
            okTitle: this.$tc('pageEventSettings.deleteSubscription'),
            cancelTitle: this.$t('global.action.cancel'),
          },
        )
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.deleteSubscription(subscription);
          }
        });
    },
    deleteSubscription(subscription) {
      this.startLoader();
      this.$store
        .dispatch('eventSettings/deleteSubscription', subscription)
        .then((success) => this.successToast(success))
        .catch((error) => this.errorToast(error))
        .finally(() => this.endLoader());
    },
    sentTestMessage() {
      this.startLoader();
      this.$store
        .dispatch('eventSettings/sentTestMessage')
        .then((success) => this.successToast(success))
        .catch((error) => this.errorToast(error))
        .finally(() => this.endLoader());
    },
    onBatchAction(action) {
      switch (action) {
        case 'delete':
          this.$bvModal
            .msgBoxConfirm(
              this.$tc(
                'pageEventSettings.modal.batchDeleteConfirmMessage',
                this.selectedRows.length,
              ),
              {
                title: this.$tc(
                  'pageEventSettings.deleteSubscription',
                  this.selectedRows.length,
                ),
                okTitle: this.$tc(
                  'pageEventSettings.deleteSubscription',
                  this.selectedRows.length,
                ),
              },
            )
            .then((deleteConfirmed) => {
              if (deleteConfirmed) {
                this.startLoader();
                this.$store
                  .dispatch(
                    'eventSettings/deleteSubscriptions',
                    this.selectedRows,
                  )
                  .then((messages) => {
                    messages.forEach(({ type, message }) => {
                      if (type === 'success') this.successToast(message);
                      if (type === 'error') this.errorToast(message);
                    });
                  })
                  .finally(() => this.endLoader());
              }
            });
          break;
      }
    },
    onTableRowAction(action, row) {
      switch (action) {
        case 'delete':
          this.initModalDelete(row);
          break;
        default:
          break;
      }
    },
  },
};
</script>
