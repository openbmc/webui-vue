<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col xl="9" class="text-end">
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
          :busy="isBusy"
          :fields="fields"
          :items="tableItems"
          :empty-text="$t('global.table.emptyMessage')"
          @row-selected="onRowSelected($event, tableItems.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              data-test-id="userManagement-checkbox-tableHeaderCheckbox"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              @change="onChangeHeaderCheckbox($refs.table, $event)"
            >
              <span class="visually-hidden-focusable">
                {{ $t('global.table.selectAll') }}
              </span>
            </b-form-checkbox>
          </template>
          <template #cell(checkbox)="row">
            <span
              v-if="isRootUser(row.item)"
              v-b-tooltip.hover="{
                title: $t('pageUserManagement.toast.rootCannotBeSelected'),
                placement: 'right',
                boundary: 'viewport',
                container: 'body',
                customClass: 'user-management-tooltip',
              }"
              class="d-inline-flex"
            >
              <b-form-checkbox
                v-model="row.rowSelected"
                disabled
                :aria-label="$t('pageUserManagement.toast.rootCannotBeSelected')"
                data-test-id="userManagement-checkbox-toggleSelectRow"
                @change="toggleSelectRow($refs.table, row.index)"
              >
                <span class="visually-hidden-focusable">
                  {{ $t('global.table.selectItem') }}
                </span>
              </b-form-checkbox>
            </span>
            <b-form-checkbox
              v-else
              v-model="row.rowSelected"
              data-test-id="userManagement-checkbox-toggleSelectRow"
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
    <modal-settings
      v-model="showSettingsModal"
      :settings="setting"
      @ok="saveAccountSettings"
    />
    <modal-user
      v-model="showUserModal"
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
import i18n from '@/i18n';
import { useModal } from 'bootstrap-vue-next';

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
  setup() {
    const bvModal = useModal();
    return { bvModal };
  },
  data() {
    return {
      isBusy: true,
      activeUser: null,
      setting: {},
      fields: [
        {
          key: 'checkbox',
        },
        {
          key: 'username',
          label: i18n.global.t('pageUserManagement.table.username'),
        },
        {
          key: 'privilege',
          label: i18n.global.t('pageUserManagement.table.privilege'),
        },
        {
          key: 'status',
          label: i18n.global.t('pageUserManagement.table.status'),
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
        {
          value: 'enable',
          label: i18n.global.t('global.action.enable'),
        },
        {
          value: 'disable',
          label: i18n.global.t('global.action.disable'),
        },
      ],
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
      showUserModal: false,
      showSettingsModal: false,
    };
  },
  computed: {
    allUsers() {
      return this.$store.getters['userManagement/allUsers'];
    },
    tableItems() {
      return this.allUsers.map((user) => {
        const isSelf = user.UserName === this.$store.getters['global/username'];
        const isRoot = this.isRootUser(user);
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
              enabled: this.editEnable(user),
              title: i18n.global.t('pageUserManagement.editUser'),
            },
            {
              value: 'delete',
              enabled: !isSelf && !isRoot,
              title: i18n.global.t('pageUserManagement.deleteUser'),
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
    this.$store.dispatch('userManagement/getUsers').finally(() => {
      this.endLoader();
      this.isBusy = false;
    });
    this.$store.dispatch('userManagement/getAccountSettings');
    this.$store.dispatch('userManagement/getAccountRoles');
  },
  methods: {
    onChangeHeaderCheckbox(tableRef, event) {
      if (!tableRef) return;

      const isChecked =
        typeof event === 'boolean' ? event : event?.target?.checked;

      if (isChecked) {
        const currentPage = this.currentPage || 1;
        const perPage = this.perPage || 10;
        const startIndex = (currentPage - 1) * perPage;
        const allItems = tableRef.filteredItems || tableRef.items || [];
        const endIndex = Math.min(startIndex + perPage, allItems.length);

        for (let i = startIndex; i < endIndex; i++) {
          if (!this.isRootUser(allItems[i])) {
            tableRef.selectRow(i);
          }
        }

        this.$nextTick(() => {
          this.onRowSelected();
        });
      } else {
        tableRef.clearSelected();
        this.selectedRows = [];
        this.tableHeaderCheckboxModel = false;
        this.tableHeaderCheckboxIndeterminate = false;
      }
    },
    isRootUser(user) {
      return this.$store.getters['userManagement/isRootUser'](user);
    },
    editEnable(user) {
      if (this.isRootUser(this.$store.getters['global/username'])) {
        return true;
      } else {
        return !this.isRootUser(user);
      }
    },
    initModalUser(user) {
      this.activeUser = user;
      this.showUserModal = true;
    },
    initModalDelete(user) {
      this.confirmDialog(
        i18n.global.t('pageUserManagement.modal.deleteConfirmMessage', {
          user: user.username,
        }),
        {
          title: i18n.global.t('pageUserManagement.deleteUser'),
          okTitle: i18n.global.t('pageUserManagement.deleteUser'),
          cancelTitle: i18n.global.t('global.action.cancel'),
          autoFocusButton: 'ok',
        },
      ).then((deleteConfirmed) => {
        if (deleteConfirmed) {
          this.deleteUser(user);
        }
      });
    },
    initModalSettings() {
      this.setting = this.settings;
      this.showSettingsModal = true;
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
      const count = this.selectedRows.length;
      switch (action) {
        case 'delete':
          this.confirmDialog(
            i18n.global.t(
              'pageUserManagement.modal.batchDeleteConfirmMessage',
              count,
            ),
            {
              title: i18n.global.t('pageUserManagement.deleteUser', count),
              okTitle: i18n.global.t('pageUserManagement.deleteUser', count),
              cancelTitle: i18n.global.t('global.action.cancel'),
              autoFocusButton: 'ok',
            },
          ).then((deleteConfirmed) => {
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
                .finally(() => {
                  this.clearSelectedRows(this.$refs.table);
                  this.endLoader();
                });
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
            .finally(() => {
              this.clearSelectedRows(this.$refs.table);
              this.endLoader();
            });
          break;
        case 'disable':
          this.confirmDialog(
            i18n.global.t(
              'pageUserManagement.modal.batchDisableConfirmMessage',
              count,
            ),
            {
              title: i18n.global.t('pageUserManagement.disableUser', count),
              okTitle: i18n.global.t('pageUserManagement.disableUser', count),
              cancelTitle: i18n.global.t('global.action.cancel'),
              autoFocusButton: 'ok',
            },
          ).then((disableConfirmed) => {
            if (disableConfirmed) {
              this.startLoader();
              this.$store
                .dispatch('userManagement/disableUsers', this.selectedRows)
                .then((messages) => {
                  messages.forEach(({ type, message }) => {
                    if (type === 'success') this.successToast(message);
                    if (type === 'error') this.errorToast(message);
                  });
                })
                .finally(() => {
                  this.clearSelectedRows(this.$refs.table);
                  this.endLoader();
                });
            }
          });
          break;
      }
    },
    confirmDialog(message, options = {}) {
      return this.$confirm({ message, ...options });
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

:deep(.tooltip.user-management-tooltip) {
  z-index: 1080;

  .tooltip-inner {
    max-width: 20rem;
    white-space: normal;
    text-align: left;
    line-height: 1.4;
  }
}
</style>
