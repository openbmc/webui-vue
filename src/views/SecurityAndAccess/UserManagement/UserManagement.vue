<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col xl="9" class="text-right">
        <b-button variant="link" @click="initModalSettings">
          <icon-settings />
          {{ $t('pageUserManagement.accountPolicySettings') }}
        </b-button>
        <b-button
          variant="primary"
          data-test-id="userManagement-button-addUser"
          @click="initModalUser(null)"
        >
          <icon-add />
          {{ $t('pageUserManagement.addUser') }}
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
          :busy="!tableItems.length"
          @row-selected="onRowSelected($event, tableItems.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              data-test-id="userManagement-checkbox-tableHeaderCheckbox"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              @change="onChangeHeaderCheckbox($refs.table)"
            >
              <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
            </b-form-checkbox>
          </template>
          <template #cell(checkbox)="row">
            <b-form-checkbox
              v-model="row.rowSelected"
              data-test-id="userManagement-checkbox-toggleSelectRow"
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
                <icon-edit
                  v-if="action.value === 'edit'"
                  :data-test-id="`userManagement-tableRowAction-edit-${index}`"
                />
                <icon-trashcan
                  v-if="action.value === 'delete'"
                  :data-test-id="`userManagement-tableRowAction-delete-${index}`"
                />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="8">
        <b-button
          v-b-toggle.collapse-role-table
          data-test-id="userManagement-button-viewPrivilegeRoleDescriptions"
          variant="link"
          class="mt-3"
        >
          <icon-chevron />
          {{ $t('pageUserManagement.viewPrivilegeRoleDescriptions') }}
        </b-button>
        <b-collapse id="collapse-role-table" class="mt-3">
          <table-roles />
        </b-collapse>
      </b-col>
    </b-row>
    <!-- Modals -->
    <modal-settings :settings="settings" @ok="saveAccountSettings" />
    <modal-user
      :user="activeUser"
      :password-requirements="passwordRequirements"
      @ok="saveUser"
      @hidden="activeUser = null"
    />
  </b-container>
</template>

<script>
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconSettings from '@carbon/icons-vue/es/settings/20';
import IconChevron from '@carbon/icons-vue/es/chevron--up/20';

import ModalUser from './ModalUser';
import ModalSettings from './ModalSettings';
import PageTitle from '@/components/Global/PageTitle';
import TableRoles from './TableRoles';
import TableToolbar from '@/components/Global/TableToolbar';
import TableRowAction from '@/components/Global/TableRowAction';

import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'UserManagement',
  components: {
    IconAdd,
    IconChevron,
    IconEdit,
    IconSettings,
    IconTrashcan,
    ModalSettings,
    ModalUser,
    PageTitle,
    TableRoles,
    TableRowAction,
    TableToolbar,
  },
  mixins: [BVTableSelectableMixin, BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      activeUser: null,
      fields: [
        {
          key: 'checkbox',
        },
        {
          key: 'username',
          label: this.$t('pageUserManagement.table.username'),
        },
        {
          key: 'privilege',
          label: this.$t('pageUserManagement.table.privilege'),
        },
        {
          key: 'status',
          label: this.$t('pageUserManagement.table.status'),
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
        {
          value: 'enable',
          label: this.$t('global.action.enable'),
        },
        {
          value: 'disable',
          label: this.$t('global.action.disable'),
        },
      ],
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
    };
  },
  computed: {
    allUsers() {
      return this.$store.getters['userManagement/allUsers'];
    },
    tableItems() {
      // transform user data to table data
      return this.allUsers.map((user) => {
        return {
          username: user.UserName,
          privilege: user.RoleId,
          status: user.Locked
            ? 'Locked'
            : user.Enabled
            ? 'Enabled'
            : 'Disabled',
          actions: [
            {
              value: 'edit',
              enabled: true,
              title: this.$t('pageUserManagement.editUser'),
            },
            {
              value: 'delete',
              enabled: user.UserName === 'root' ? false : true,
              title: this.$tc('pageUserManagement.deleteUser'),
            },
          ],
          ...user,
        };
      });
    },
    settings() {
      return this.$store.getters['userManagement/accountSettings'];
    },
    passwordRequirements() {
      return this.$store.getters['userManagement/accountPasswordRequirements'];
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('userManagement/getUsers')
      .finally(() => this.endLoader());
    this.$store.dispatch('userManagement/getAccountSettings');
    this.$store.dispatch('userManagement/getAccountRoles');
  },
  methods: {
    initModalUser(user) {
      this.activeUser = user;
      this.$bvModal.show('modal-user');
    },
    initModalDelete(user) {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageUserManagement.modal.deleteConfirmMessage', {
            user: user.username,
          }),
          {
            title: this.$tc('pageUserManagement.deleteUser'),
            okTitle: this.$tc('pageUserManagement.deleteUser'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.deleteUser(user);
          }
        });
    },
    initModalSettings() {
      this.$bvModal.show('modal-settings');
    },
    saveUser({ isNewUser, userData }) {
      this.startLoader();
      if (isNewUser) {
        this.$store
          .dispatch('userManagement/createUser', userData)
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message))
          .finally(() => this.endLoader());
      } else {
        this.$store
          .dispatch('userManagement/updateUser', userData)
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message))
          .finally(() => this.endLoader());
      }
    },
    deleteUser({ username }) {
      this.startLoader();
      this.$store
        .dispatch('userManagement/deleteUser', username)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    onBatchAction(action) {
      switch (action) {
        case 'delete':
          this.$bvModal
            .msgBoxConfirm(
              this.$tc(
                'pageUserManagement.modal.batchDeleteConfirmMessage',
                this.selectedRows.length
              ),
              {
                title: this.$tc(
                  'pageUserManagement.deleteUser',
                  this.selectedRows.length
                ),
                okTitle: this.$tc(
                  'pageUserManagement.deleteUser',
                  this.selectedRows.length
                ),
                cancelTitle: this.$t('global.action.cancel'),
              }
            )
            .then((deleteConfirmed) => {
              if (deleteConfirmed) {
                this.startLoader();
                this.$store
                  .dispatch('userManagement/deleteUsers', this.selectedRows)
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
        case 'enable':
          this.startLoader();
          this.$store
            .dispatch('userManagement/enableUsers', this.selectedRows)
            .then((messages) => {
              messages.forEach(({ type, message }) => {
                if (type === 'success') this.successToast(message);
                if (type === 'error') this.errorToast(message);
              });
            })
            .finally(() => this.endLoader());
          break;
        case 'disable':
          this.startLoader();
          this.$store
            .dispatch('userManagement/disableUsers', this.selectedRows)
            .then((messages) => {
              messages.forEach(({ type, message }) => {
                if (type === 'success') this.successToast(message);
                if (type === 'error') this.errorToast(message);
              });
            })
            .finally(() => this.endLoader());
          break;
      }
    },
    onTableRowAction(action, row) {
      switch (action) {
        case 'edit':
          this.initModalUser(row);
          break;
        case 'delete':
          this.initModalDelete(row);
          break;
        default:
          break;
      }
    },
    saveAccountSettings(settings) {
      this.startLoader();
      this.$store
        .dispatch('userManagement/saveAccountSettings', settings)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>

<style lang="scss" scoped>
.btn.collapsed {
  svg {
    transform: rotate(180deg);
  }
}
</style>
