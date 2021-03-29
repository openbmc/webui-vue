<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageSnmpAlerts.pageDescription')" />
    <b-row>
      <b-col xl="9" class="text-right">
        <b-button
          variant="primary"
          data-test-id="snmpAlerts-button-addDestination"
          @click="initModalAddDestination"
        >
          <icon-add />
          {{ $t('pageSnmpAlerts.addDestination') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="9">
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
          :fields="fields"
          :items="tableItems"
          :empty-text="$t('global.table.emptyMessage')"
          @row-selected="onRowSelected($event, tableItems.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              data-test-id="snmpAlerts-checkbox-selectAll"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              @change="onChangeHeaderCheckbox($refs.table)"
            >
              <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
            </b-form-checkbox>
          </template>
          <template #cell(checkbox)="row">
            <b-form-checkbox
              v-model="row.rowSelected"
              :data-test-id="`snmpAlerts-checkbox-selectRow-${row.index}`"
              @change="toggleSelectRow($refs.table, row.index)"
            >
              <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
            </b-form-checkbox>
          </template>

          <!-- table actions column -->
          <template #cell(actions)="{ item }">
            <table-row-action
              v-for="(action, index) in item.actions"
              :key="index"
              :value="action.value"
              :enabled="action.enabled"
              :title="action.title"
              :data-test-id="`snmpAlerts-button-deleteRow-${index}`"
              @click-table-action="onTableRowAction($event, item)"
            >
              <template #icon>
                <icon-trashcan v-if="action.value === 'delete'" />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <!-- Modals -->
    <modal-add-destination @ok="onModalOk" />
  </b-container>
</template>

<script>
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import ModalAddDestination from './ModalAddDestination';
import PageTitle from '@/components/Global/PageTitle';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import TableToolbar from '@/components/Global/TableToolbar';
import TableRowAction from '@/components/Global/TableRowAction';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
export default {
  name: 'SnmpAlerts',
  components: {
    PageTitle,
    IconAdd,
    TableToolbar,
    IconTrashcan,
    ModalAddDestination,
    TableRowAction,
  },
  mixins: [BVTableSelectableMixin, BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
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
          key: 'IP',
          label: this.$t('pageSnmpAlerts.table.ipaddress'),
        },
        {
          key: 'Port',
          label: this.$t('pageSnmpAlerts.table.port'),
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
    allSnmpDetails() {
      return this.$store.getters['snmpAlerts/allSnmpDetails'];
    },
    tableItems() {
      // transform destination data to table data
      return this.allSnmpDetails.map((subscriptions) => {
        if (subscriptions.Destination.includes('://')) {
          return {
            IP: subscriptions.Destination.split('/')[2].split(':')[0],
            Port: subscriptions.Destination.split('/')[2].split(':')[1],
            id: subscriptions.Id,
            actions: [
              {
                value: 'delete',
                enabled: true,
                title: this.$tc('pageSnmpAlerts.deleteDestination'),
              },
            ],
            ...subscriptions,
          };
        } else {
          return {
            IP: subscriptions.Destination.split(':')[0],
            Port: subscriptions.Destination.split(':')[1],
            id: subscriptions.Id,
            actions: [
              {
                value: 'delete',
                enabled: true,
                title: this.$tc('pageSnmpAlerts.deleteDestination'),
              },
            ],
            ...subscriptions,
          };
        }
      });
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('snmpAlerts/getSnmpDetails')
      .finally(() => this.endLoader());
  },
  methods: {
    onModalOk({ ipAddress, port }) {
      this.startLoader();
      this.$store
        .dispatch('snmpAlerts/addDestination', { ipAddress, port })
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    initModalAddDestination() {
      this.$bvModal.show('add-destination');
    },
    initModalDeleteDestination(destination) {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageSnmpAlerts.modal.deleteConfirmMessage', {
            destination: destination.id,
          }),
          {
            title: this.$tc('pageSnmpAlerts.deleteSnmpDestination'),
            okTitle: this.$tc('pageSnmpAlerts.deleteDestination'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.deleteDestination(destination);
          }
        });
    },
    deleteDestination({ id }) {
      this.startLoader();
      this.$store
        .dispatch('snmpAlerts/deleteDestination', id)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    onBatchAction(action) {
      if (action === 'delete') {
        this.$bvModal
          .msgBoxConfirm(
            this.$tc(
              'pageSnmpAlerts.modal.batchDeleteConfirmMessage',
              this.selectedRows.length
            ),
            {
              title: this.$tc(
                'pageSnmpAlerts.deleteSnmpDestination',
                this.selectedRows.length
              ),
              okTitle: this.$tc(
                'pageSnmpAlerts.deleteDestination',
                this.selectedRows.length
              ),
              cancelTitle: this.$t('global.action.cancel'),
            }
          )
          .then((deleteConfirmed) => {
            if (deleteConfirmed) {
              this.startLoader();
              this.$store
                .dispatch('snmpAlerts/deleteDestinations', this.selectedRows)
                .then((messages) => {
                  messages.forEach(({ type, message }) => {
                    if (type === 'success') this.successToast(message);
                    if (type === 'error') this.errorToast(message);
                  });
                })
                .finally(() => this.endLoader());
            }
          });
      }
    },
    onTableRowAction(action, row) {
      if (action === 'delete') {
        this.initModalDeleteDestination(row);
      }
    },
  },
};
</script>
