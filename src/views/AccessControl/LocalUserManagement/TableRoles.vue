<template>
  <b-table bordered small head-variant="dark" :items="items" :fields="fields">
    <template v-slot:cell(administrator)="data">
      <template v-if="data.value">
        <Checkmark20 />
      </template>
    </template>
    <template v-slot:cell(operator)="data">
      <template v-if="data.value">
        <Checkmark20 />
      </template>
    </template>
    <template v-slot:cell(readonly)="data">
      <template v-if="data.value">
        <Checkmark20 />
      </template>
    </template>
    <template v-slot:cell(noaccess)="data">
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
          administrator: true,
          operator: false,
          readonly: false,
          noaccess: false
        },
        {
          description: "Configure manager resources",
          administrator: true,
          operator: false,
          readonly: false,
          noaccess: false
        },
        {
          description: "Update password for current user account",
          administrator: true,
          operator: true,
          readonly: true,
          noaccess: false
        },
        {
          description: "Configure users and their accounts",
          administrator: true,
          operator: false,
          readonly: false,
          noaccess: false
        },
        {
          description: "Log in to the service and read resources",
          administrator: true,
          operator: true,
          readonly: true,
          noaccess: false
        },
        {
          description: "IPMI access point",
          administrator: true,
          operator: true,
          readonly: true,
          noaccess: true
        },
        {
          description: "Redfish access point",
          administrator: true,
          operator: true,
          readonly: true,
          noaccess: false
        },
        {
          description: "SSH access point",
          administrator: true,
          operator: true,
          readonly: true,
          noaccess: false
        },
        {
          description: "WebUI access point",
          administrator: true,
          operator: true,
          readonly: true,
          noaccess: false
        }
      ],
      fields: [
        { key: "description", label: "" },
        { key: "administrator", label: "Administrator", class: "text-center" },
        { key: "operator", label: "Operator", class: "text-center" },
        { key: "readonly", label: "ReadOnly", class: "text-center" },
        { key: "noaccess", label: "NoAccess", class: "text-center" }
      ]
    };
  }
};
</script>
