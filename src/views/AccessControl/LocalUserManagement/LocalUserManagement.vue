<template>
  <b-container class="ml-0">
    <page-title />
    <b-row>
      <b-col lg="10" class="text-right">
        <b-button variant="link" @click="initModalSettings">
          Account policy settings
          <icon-settings />
        </b-button>
        <b-button variant="primary" @click="initModalUser(null)">
          Add user
          <icon-add />
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="10">
        <b-table show-empty :fields="fields" :items="tableItems">
          <template v-slot:cell(actions)="{ item }">
            <table-row-action
              v-for="(action, index) in item.actions"
              :key="index"
              :value="action.value"
              :enabled="action.enabled"
              @click:tableAction="onTableRowAction($event, item)"
            >
              <template v-slot:icon>
                <icon-edit v-if="action.value === 'edit'" />
                <icon-trashcan v-if="action.value === 'delete'" />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="8">
        <b-button v-b-toggle.collapse-role-table variant="link" class="mt-3">
          View privilege role descriptions
          <icon-chevron />
        </b-button>
        <b-collapse id="collapse-role-table" class="mt-3">
          <table-roles />
        </b-collapse>
      </b-col>
    </b-row>
    <!-- Modals -->
    <modal-settings :settings="settings"></modal-settings>
    <modal-user :user="activeUser" @ok="saveUser"></modal-user>
  </b-container>
</template>

<script>
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconSettings from '@carbon/icons-vue/es/settings/20';
import IconChevron from '@carbon/icons-vue/es/chevron--up/20';

import TableRoles from './TableRoles';
import ModalUser from './ModalUser';
import ModalSettings from './ModalSettings';
import PageTitle from '../../../components/Global/PageTitle';
import BVToastMixin from '../../../components/Mixins/BVToastMixin';
import TableRowAction from '../../../components/Global/TableRowAction';

export default {
  name: 'LocalUsers',
  components: {
    IconAdd,
    IconChevron,
    IconEdit,
    IconSettings,
    IconTrashcan,
    ModalSettings,
    ModalUser,
    TableRoles,
    PageTitle,
    TableRowAction
  },
  mixins: [BVToastMixin],
  data() {
    return {
      activeUser: null,
      settings: null,
      fields: [
        'username',
        'privilege',
        'status',
        {
          key: 'actions',
          label: '',
          tdClass: 'text-right'
        }
      ]
    };
  },
  computed: {
    allUsers() {
      return this.$store.getters['localUsers/allUsers'];
    },
    tableItems() {
      // transform user data to table data
      return this.allUsers.map(user => {
        return {
          username: user.UserName,
          privilege: user.RoleId,
          status: user.Locked
            ? 'Locked'
            : user.Enabled
            ? 'Enabled'
            : 'Disabled',
          actions: [
            { value: 'edit', enabled: true },
            {
              value: 'delete',
              enabled: user.UserName === 'root' ? false : true
            }
          ],
          ...user
        };
      });
    }
  },
  created() {
    this.getUsers();
  },
  methods: {
    getUsers() {
      this.$store.dispatch('localUsers/getUsers');
    },
    initModalUser(user) {
      this.activeUser = user;
      this.$bvModal.show('modal-user');
    },
    initModalDelete(user) {
      this.$bvModal
        .msgBoxConfirm(
          `Are you sure you want to delete user '${user.username}'? This action cannot be undone.`,
          {
            title: 'Delete user',
            okTitle: 'Delete user'
          }
        )
        .then(deleteConfirmed => {
          if (deleteConfirmed) {
            this.deleteUser(user);
          }
        });
    },
    initModalSettings() {
      if (this.settings) {
        this.$bvModal.show('modal-settings');
      } else {
        // fetch settings then show modal
      }
    },
    saveUser({ isNewUser, userData }) {
      if (isNewUser) {
        this.$store
          .dispatch('localUsers/createUser', userData)
          .then(success => this.successToast(success))
          .catch(({ message }) => this.errorToast(message));
      } else {
        this.$store
          .dispatch('localUsers/updateUser', userData)
          .then(success => this.successToast(success))
          .catch(({ message }) => this.errorToast(message));
      }
    },
    deleteUser({ username }) {
      this.$store
        .dispatch('localUsers/deleteUser', username)
        .then(success => this.successToast(success))
        .catch(({ message }) => this.errorToast(message));
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
    }
  }
};
</script>

<style lang="scss" scoped>
h1 {
  margin-bottom: 2rem;
}
.btn.collapsed {
  svg {
    transform: rotate(180deg);
  }
}
</style>
