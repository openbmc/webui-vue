<template>
  <b-table bordered small head-variant="dark" :items="items" :fields="fields">
    <template v-slot:cell(admin)="data">
      <template v-if="data.value">
        <Checkmark20 />
      </template>
    </template>
    <template v-slot:cell(operator)="data">
      <template v-if="data.value">
        <Checkmark20 />
      </template>
    </template>
    <template v-slot:cell(user)="data">
      <template v-if="data.value">
        <Checkmark20 />
      </template>
    </template>
    <template v-slot:cell(callback)="data">
      <template v-if="data.value">
        <Checkmark20 />
      </template>
    </template>
  </b-table>
</template>

<script>
import Checkmark20 from "@carbon/icons-vue/es/checkmark/20";

export default {
  components: {
    Checkmark20
  },
  data() {
    return {
      items: [
        {
          description: "Configure components managed by this service",
          admin: true,
          operator: false,
          user: false,
          callback: false
        },
        {
          description: "Configure manager resources",
          admin: true,
          operator: false,
          user: false,
          callback: false
        },
        {
          description: "Update password for current user account",
          admin: true,
          operator: true,
          user: true,
          callback: false
        },
        {
          description: "Update password for current user account",
          admin: true,
          operator: true,
          user: true,
          callback: false
        },
        {
          description: "Configure users and their accounts",
          admin: true,
          operator: false,
          user: false,
          callback: false
        },
        {
          description: "Log in to the service and read resources",
          admin: true,
          operator: true,
          user: true,
          callback: false
        },
        {
          description: "IPMI access point",
          admin: true,
          operator: true,
          user: true,
          callback: true
        },
        {
          description: "Redfish access point",
          admin: true,
          operator: true,
          user: true,
          callback: false
        },
        {
          description: "SSH access point",
          admin: true,
          operator: true,
          user: true,
          callback: false
        },
        {
          description: "WebUI access point",
          admin: true,
          operator: true,
          user: true,
          callback: false
        }
      ],
      fields: [
        { key: "description", label: "" },
        { key: "admin", label: "Admin", class: "text-center" },
        { key: "operator", label: "Operator", class: "text-center" },
        { key: "user", label: "User", class: "text-center" },
        { key: "callback", label: "Callback", class: "text-center" }
      ]
    };
  }
};
</script>
