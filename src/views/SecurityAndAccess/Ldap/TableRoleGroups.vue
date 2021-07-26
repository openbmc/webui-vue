<template>
  <div>
    <b-row>
      <b-col md="9">
        <alert :show="isServiceEnabled === false" variant="info">
          {{ $t('pageLdap.tableRoleGroups.alertContent') }}
        </alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="text-right" md="9">
        <b-btn
          variant="primary"
          :disabled="!isServiceEnabled"
          @click="initRoleGroupModal(null)"
        >
          <icon-add />
          {{ $t('pageLdap.addRoleGroup') }}
        </b-btn>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="9">
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          :actions="batchActions"
          @clear-selected="clearSelectedRows($refs.table)"
          @batch-action="onBatchAction"
        />
        <b-table
          ref="table"
          responsive
          selectable
          show-empty
          no-select-on-click
          hover
          no-sort-reset
          sort-icon-left
          :items="tableItems"
          :fields="fields"
          :empty-text="$t('global.table.emptyMessage')"
          @row-selected="onRowSelected($event, tableItems.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              :disabled="!isServiceEnabled"
              @change="onChangeHeaderCheckbox($refs.table)"
            >
              <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
            </b-form-checkbox>
          </template>
          <template #cell(checkbox)="row">
            <b-form-checkbox
              v-model="row.rowSelected"
              :disabled="!isServiceEnabled"
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
              @click-table-action="onTableRowAction($event, item)"
            >
              <template #icon>
                <icon-edit v-if="action.value === 'edit'" />
                <icon-trashcan v-if="action.value === 'delete'" />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <modal-add-role-group
      :role-group="activeRoleGroup"
      @ok="saveRoleGroup"
      @hidden="activeRoleGroup = null"
    />
  </div>
</template>

<script>
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import { mapGetters } from 'vuex';

import Alert from '@/components/Global/Alert';
import TableToolbar from '@/components/Global/TableToolbar';
import TableRowAction from '@/components/Global/TableRowAction';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import ModalAddRoleGroup from './ModalAddRoleGroup';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  components: {
    Alert,
    IconAdd,
    IconEdit,
    IconTrashcan,
    ModalAddRoleGroup,
    TableRowAction,
    TableToolbar,
  },
  mixins: [BVTableSelectableMixin, BVToastMixin, LoadingBarMixin],
  data() {
    return {
      activeRoleGroup: null,
      fields: [
        {
          key: 'checkbox',
          sortable: false,
        },
        {
          key: 'groupName',
          sortable: true,
          label: this.$t('pageLdap.tableRoleGroups.groupName'),
        },
        {
          key: 'groupPrivilege',
          sortable: true,
          label: this.$t('pageLdap.tableRoleGroups.groupPrivilege'),
        },
        {
          key: 'actions',
          sortable: false,
          label: '',
          tdClass: 'text-right',
        },
      ],
      batchActions: [
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
    ...mapGetters('ldap', ['isServiceEnabled', 'enabledRoleGroups']),
    tableItems() {
      return this.enabledRoleGroups.map(({ LocalRole, RemoteGroup }) => {
        return {
          groupName: RemoteGroup,
          groupPrivilege: LocalRole,
          actions: [
            {
              value: 'edit',
              title: this.$t('global.action.edit'),
              enabled: this.isServiceEnabled,
            },
            {
              value: 'delete',
              title: this.$t('global.action.delete'),
              enabled: this.isServiceEnabled,
            },
          ],
        };
      });
    },
  },
  created() {
    this.$store.dispatch('userManagement/getAccountRoles');
  },
  methods: {
    onBatchAction() {
      this.$bvModal
        .msgBoxConfirm(
          this.$tc(
            'pageLdap.modal.deleteRoleGroupBatchConfirmMessage',
            this.selectedRows.length
          ),
          {
            title: this.$t('pageLdap.modal.deleteRoleGroup'),
            okTitle: this.$t('global.action.delete'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.startLoader();
            this.$store
              .dispatch('ldap/deleteRoleGroup', {
                roleGroups: this.selectedRows,
              })
              .then((success) => this.successToast(success))
              .catch(({ message }) => this.errorToast(message))
              .finally(() => this.endLoader());
          }
        });
    },
    onTableRowAction(action, row) {
      switch (action) {
        case 'edit':
          this.initRoleGroupModal(row);
          break;
        case 'delete':
          this.$bvModal
            .msgBoxConfirm(
              this.$t('pageLdap.modal.deleteRoleGroupConfirmMessage', {
                groupName: row.groupName,
              }),
              {
                title: this.$t('pageLdap.modal.deleteRoleGroup'),
                okTitle: this.$t('global.action.delete'),
                cancelTitle: this.$t('global.action.cancel'),
              }
            )
            .then((deleteConfirmed) => {
              if (deleteConfirmed) {
                this.startLoader();
                this.$store
                  .dispatch('ldap/deleteRoleGroup', { roleGroups: [row] })
                  .then((success) => this.successToast(success))
                  .catch(({ message }) => this.errorToast(message))
                  .finally(() => this.endLoader());
              }
            });
          break;
      }
    },
    initRoleGroupModal(roleGroup) {
      this.activeRoleGroup = roleGroup;
      this.$bvModal.show('modal-role-group');
    },
    saveRoleGroup({ addNew, groupName, groupPrivilege }) {
      this.activeRoleGroup = null;
      const data = { groupName, groupPrivilege };
      this.startLoader();
      if (addNew) {
        this.$store
          .dispatch('ldap/addNewRoleGroup', data)
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message))
          .finally(() => this.endLoader());
      } else {
        this.$store
          .dispatch('ldap/saveRoleGroup', data)
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message))
          .finally(() => this.endLoader());
      }
    },
  },
};
</script>
