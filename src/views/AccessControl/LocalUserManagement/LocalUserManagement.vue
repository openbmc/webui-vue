<template>
  <b-container class="ml-0">
    <b-row>
      <b-col lg="10">
        <h1>Local user management</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="10">
        <b-button @click="initModalSettings" variant="link">
          <icon-settings />
          Account policy settings
        </b-button>
        <b-button @click="initModalUser(null)" variant="primary">
          <icon-add />
          Add user
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="10">
        <b-table bordered show-empty head-variant="dark" :items="tableItems">
          <template v-slot:head(actions)="data"></template>
          <template v-slot:cell(actions)="data">
            <b-button
              aria-label="Edit user"
              variant="link"
              :disabled="!data.value.edit"
              @click="initModalUser(data.item)"
            >
              <icon-edit />
            </b-button>
            <b-button
              aria-label="Delete user"
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
      <b-col lg="8">
        <b-button v-b-toggle.collapse-role-table variant="link" class="mt-3">
          View privilege role descriptions
        </b-button>
        <b-collapse id="collapse-role-table" class="mt-3">
          <table-roles />
        </b-collapse>
      </b-col>
    </b-row>
    <!-- Modals -->
    <modal-settings v-bind:settings="settings"></modal-settings>
    <modal-user
      v-bind:user="activeUser"
      @ok="saveUser"
      @hidden="clearActiveUser"
    ></modal-user>
  </b-container>
</template>

<script>
import IconTrashcan from "@carbon/icons-vue/es/trash-can/20";
import IconEdit from "@carbon/icons-vue/es/edit/20";
import IconAdd from "@carbon/icons-vue/es/add--alt/20";
import IconSettings from "@carbon/icons-vue/es/settings/20";

import TableRoles from "./TableRoles";
import ModalUser from "./ModalUser";
import ModalSettings from "./ModalSettings";

export default {
  name: "local-users",
  components: {
    IconAdd,
    IconEdit,
    IconSettings,
    IconTrashcan,
    ModalSettings,
    ModalUser,
    TableRoles
  },
  data() {
    return {
      activeUser: null,
      settings: null
    };
  },
  created() {
    this.getUsers();
  },
  computed: {
    allUsers() {
      return this.$store.getters["localUsers/allUsers"];
    },
    tableItems() {
      // transform user data to table data
      return this.allUsers.map(user => {
        return {
          username: user.UserName,
          privilege: user.RoleId,
          status: user.Locked
            ? "Locked"
            : user.Enabled
            ? "Enabled"
            : "Disabled",
          actions: {
            edit: true,
            delete: user.UserName === "root" ? false : true
          }
        };
      });
    }
  },
  methods: {
    getUsers() {
      this.$store.dispatch("localUsers/getUsers");
    },
    initModalUser(user) {
      this.activeUser = user;
      this.$bvModal.show("modal-user");
    },
    initModalDelete(user) {
      this.$bvModal
        .msgBoxConfirm(
          `Are you sure you want to delete user '${user.username}'? This action cannot be undone.`,
          {
            title: "Delete user",
            okTitle: "Delete user"
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
        this.$bvModal.show("modal-settings");
      } else {
        // fetch settings then show modal
      }
    },
    saveUser({ newUser, form }) {
      if (newUser) {
        this.$store.dispatch("localUsers/createUser", form);
      } else {
        this.$store.dispatch("localUsers/updateUser", form);
      }
    },
    deleteUser({ username }) {
      this.$store.dispatch("localUsers/deleteUser", username);
    },
    clearActiveUser() {
      this.activeUser = null;
    }
  }
};
</script>

<style lang="scss" scoped>
h1 {
  margin-bottom: 2rem;
}
</style>
