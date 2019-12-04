<template>
  <b-modal
    id="modal-user"
    @ok="$emit('ok', { newUser, form })"
    @hidden="$emit('hidden')"
  >
    <template v-slot:modal-title>
      <template v-if="newUser">
        Add user
      </template>
      <template v-else>
        Edit user
      </template>
    </template>
    <b-form>
      <b-form-group label="Account status">
        <b-form-radio v-model="form.status" name="user-status" value="true"
          >Enabled</b-form-radio
        >
        <b-form-radio v-model="form.status" name="user-status" value="false"
          >Disabled</b-form-radio
        >
      </b-form-group>
      <b-form-group label="Username">
        <b-form-input type="text" v-model="form.username" />
      </b-form-group>
      <b-form-group label="Privilege">
        <b-form-select
          v-model="form.privilege"
          :options="privilegeTypes"
        ></b-form-select>
      </b-form-group>
      <b-form-group label="Password">
        <b-form-input type="password" v-model="form.password" />
      </b-form-group>
    </b-form>
    <template v-slot:modal-ok>
      <template v-if="newUser">
        Add user
      </template>
      <template v-else>
        Save
      </template>
    </template>
  </b-modal>
</template>

<script>
export default {
  props: ["user"],
  data() {
    return {
      privilegeTypes: ["Administrator", "Operator", "ReadOnly", "NoAccess"]
    };
  },
  computed: {
    newUser() {
      return this.user ? false : true;
    },
    form() {
      return {
        originalUsername: this.newUser ? null : this.user.username,
        status: this.newUser
          ? true
          : this.user.status === "Enabled"
          ? true
          : false,
        username: this.newUser ? "" : this.user.username,
        privilege: this.newUser ? "" : this.user.privilege,
        password: ""
      };
    }
  }
};
</script>
