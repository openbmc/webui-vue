<template>
  <b-container fluid>
    <b-row>
      <b-col lg="8">
        <h1>Local user management</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="8" md="10">
        <b-button v-b-modal.modal-settings variant="secondary"
          >Account policy settings</b-button
        >
        <b-button v-b-modal.modal-add-user variant="primary">Add user</b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="8" md="10">
        <b-table bordered head-variant="dark" :items="tableItems" show-empty>
          <template v-slot:head(actions)="data"></template>
          <template v-slot:cell(actions)="data">
            <b-button
              :disabled="!data.value.edit"
              v-b-modal.modal-user-settings
            >
              <Edit20 />
            </b-button>
            <b-button
              :disabled="!data.value.delete"
              v-b-modal.modal-user-delete
            >
              <TrashCan20 />
            </b-button>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="6" md="8">
        <b-button v-b-toggle.collapse-role-table variant="info" class="mt-3"
          >View privilege role descriptions</b-button
        >
        <b-collapse id="collapse-role-table" class="mt-3">
          <role-table />
        </b-collapse>
      </b-col>
    </b-row>
    <!-- Modals -->
    <b-modal id="modal-add-user" title="Add user" ref="modal">
      <template v-slot:modal-footer="{ ok, cancel, hide }">
        <b-button
          size="sm"
          variant="secondary"
          @click="$bvModal.hide('modal-add-user')"
          >Cancel</b-button
        >
        <b-button
          size="sm"
          variant="primary"
          @click="$bvModal.hide('modal-add-user')"
          >Add user</b-button
        >
      </template>
    </b-modal>
    <b-modal id="modal-settings" title="Account policy settings"></b-modal>
    <b-modal id="modal-user-delete" title="Delete user"></b-modal>
    <b-modal id="modal-user-settings" title="User settings"></b-modal>
  </b-container>
</template>

<script>
import LocalUserManagementRoleTable from "./LocalUserMangementRoleTable";
import TrashCan20 from "@carbon/icons-vue/es/trash-can/20";
import Edit20 from "@carbon/icons-vue/es/edit/20";

export default {
  name: "local-users",
  components: {
    TrashCan20,
    Edit20,
    roleTable: LocalUserManagementRoleTable
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
    }
  }
};
</script>

<style lang="scss" scoped>
h1 {
  margin-bottom: 2rem;
}
</style>
