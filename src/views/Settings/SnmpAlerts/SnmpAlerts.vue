<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageSnmpAlerts.pageDescription')" />
    <b-row>
      <b-col xl="9" class="text-end">
        <b-button variant="primary" @click="initModalAddDestination">
          <icon-add />
          {{ $t('pageSnmpAlerts.addDestination') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="9">
        <table-toolbar
          ref="toolbar"
          :selected-items-count="
            Array.isArray(selectedRows) ? selectedRows.length : 0
          "
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
          thead-class="table-light"
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
              :data-test-id="`snmpAlerts-checkbox-selectRow-${row.index}`"
              @change="toggleSelectRow($refs.table, row.index)"
            >
              <span class="visually-hidden-focusable">
                {{ $t('global.table.selectItem') }}
              </span>
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
              :data-test-id="`snmpAlerts-button-deleteRow-${item.index}`"
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
    <modal-add-destination v-model="showAddDestination" @ok="onModalOk" />
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
import { useModal } from 'bootstrap-vue-next';

import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import i18n from '@/i18n';

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
  setup() {
    const bvModal = useModal();
    return { bvModal };
  },
  data() {
    return {
      showAddDestination: false,
      fields: [
        {
          key: 'checkbox',
        },
        {
          key: 'IP',
          label: i18n.global.t('pageSnmpAlerts.table.ipaddress'),
        },
        {
          key: 'Port',
          label: i18n.global.t('pageSnmpAlerts.table.port'),
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-end text-nowrap',
        },
      ],
      tableToolbarActions: [
        {
          value: 'delete',
          label: i18n.global.t('global.action.delete'),
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
        const [destination, dataWithProtocol, dataWithoutProtocol] = [
          subscriptions.Destination,
          subscriptions.Destination.split('/')[2].split(':'),
          subscriptions.Destination.split(':'),
        ];
        //condition to check if destination comes with protocol or not
        const conditionForProtocolCheck = destination.includes('://');
        const ip = conditionForProtocolCheck
          ? dataWithProtocol[0]
          : dataWithoutProtocol[0];
        const port = conditionForProtocolCheck
          ? dataWithProtocol[1]
          : dataWithoutProtocol[1];
        return {
          IP: ip,
          Port: port,
          id: subscriptions.Id,
          actions: [
            {
              value: 'delete',
              enabled: true,
              title: i18n.global.t('pageSnmpAlerts.deleteDestination'),
            },
          ],
          ...subscriptions,
        };
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
      const protocolIpAddress = 'snmp://' + ipAddress;
      const destination = port
        ? protocolIpAddress + ':' + port
        : protocolIpAddress;
      const data = {
        Destination: destination,
        SubscriptionType: 'SNMPTrap',
        Protocol: 'SNMPv2c',
      };
      this.startLoader();
      this.$store
        .dispatch('snmpAlerts/addDestination', { data })
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    initModalAddDestination() {
      this.showAddDestination = true;
    },
    initModalDeleteDestination(destination) {
      this.confirmDialog(
        i18n.global.t('pageSnmpAlerts.modal.deleteConfirmMessage', {
          destination: destination.id,
        }),
        {
          title: i18n.global.t(
            'pageSnmpAlerts.modal.deleteSnmpDestinationTitle',
          ),
          okTitle: i18n.global.t('pageSnmpAlerts.deleteDestination'),
          cancelTitle: i18n.global.t('global.action.cancel'),
          autoFocusButton: 'ok',
        },
      ).then((deleteConfirmed) => {
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
        const count = this.selectedRows.length;
        this.confirmDialog(
          i18n.global.t(
            'pageSnmpAlerts.modal.batchDeleteConfirmMessage',
            count,
          ),
          {
            title: i18n.global.t(
              'pageSnmpAlerts.modal.deleteSnmpDestinationTitle',
              count,
            ),
            okTitle: i18n.global.t('pageSnmpAlerts.deleteDestination', count),
            cancelTitle: i18n.global.t('global.action.cancel'),
            autoFocusButton: 'ok',
          },
        ).then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.startLoader();
            this.$store
              .dispatch(
                'snmpAlerts/deleteMultipleDestinations',
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
      }
    },
    confirmDialog(message, options = {}) {
      return this.$confirm({ message, ...options });
    },
    onTableRowAction(action, row) {
      if (action === 'delete') {
        this.initModalDeleteDestination(row);
      }
    },
  },
};
</script>
