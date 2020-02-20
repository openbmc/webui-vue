<template>
  <b-container fluid>
    <page-title />
    <b-row>
      <b-col xl="9" class="text-right">
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
      <b-col xl="9">
        <b-table show-empty :fields="fields" :items="tableItems">
          <template v-slot:cell(actions)="data">
            <b-button
              aria-label="Edit user"
              title="Edit user"
              variant="link"
              :disabled="!data.value.edit"
              @click="initModalUser(data.item)"
            >
              <icon-edit />
            </b-button>
            <b-button
              aria-label="Delete user"
              title="Delete user"
              variant="link"
              :disabled="!data.value.delete"
              @click="initModalDelete(data.item)"
            >
              <icon-trashcan />
            </b-button>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="8">
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
    <modal-settings :settings="settings" @ok="saveAccountSettings" />
    <modal-user
      :user="activeUser"
      :password-requirements="passwordRequirements"
      @ok="saveUser"
    />
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
    PageTitle
  },
  mixins: [BVToastMixin],
  data() {
    return {
      activeUser: null,
      fields: [
        'username',
        'privilege',
        'status',
        {
          key: 'actions',
          label: '',
          tdClass: 'table-cell__actions'
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
          actions: {
            edit: true,
            delete: user.UserName === 'root' ? false : true
          },
          ...user
        };
      });
    },
    settings() {
      return this.$store.getters['localUsers/accountSettings'];
    },
    passwordRequirements() {
      return this.$store.getters['localUsers/accountPasswordRequirements'];
    }
  },
  created() {
    this.getUsers();
    this.getAccountSettings();
  },
  methods: {
    getUsers() {
      this.$store.dispatch('localUsers/getUsers');
    },
    getAccountSettings() {
      this.$store.dispatch('localUsers/getAccountSettings');
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
    saveAccountSettings(settings) {
      this.$store
        .dispatch('localUsers/saveAccountSettings', settings)
        .then(message => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
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
