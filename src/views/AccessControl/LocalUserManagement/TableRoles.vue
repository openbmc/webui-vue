<template>
  <b-table stacked="sm" hover small :items="items" :fields="fields">
    <template #cell(administrator)="data">
      <template v-if="data.value">
        <checkmark20 />
      </template>
    </template>
    <template #cell(operator)="data">
      <template v-if="data.value">
        <checkmark20 />
      </template>
    </template>
    <template #cell(readonly)="data">
      <template v-if="data.value">
        <checkmark20 />
      </template>
    </template>
    <template #cell(noaccess)="data">
      <template v-if="data.value">
        <checkmark20 />
      </template>
    </template>
  </b-table>
</template>

<script>
import Checkmark20 from '@carbon/icons-vue/es/checkmark/20';

export default {
  components: {
    Checkmark20,
  },
  data() {
    return {
      items: [
        {
          description: this.$t(
            'pageLocalUserManagement.tableRoles.configureComponentsManagedByThisService'
          ),
          administrator: true,
          operator: true,
          readonly: false,
          noaccess: false,
        },
        {
          description: this.$t(
            'pageLocalUserManagement.tableRoles.configureManagerResources'
          ),
          administrator: true,
          operator: false,
          readonly: false,
          noaccess: false,
        },
        {
          description: this.$t(
            'pageLocalUserManagement.tableRoles.updatePasswordForCurrentUserAccount'
          ),
          administrator: true,
          operator: true,
          readonly: true,
          noaccess: false,
        },
        {
          description: this.$t(
            'pageLocalUserManagement.tableRoles.configureUsersAndTheirAccounts'
          ),
          administrator: true,
          operator: false,
          readonly: false,
          noaccess: false,
        },
        {
          description: this.$t(
            'pageLocalUserManagement.tableRoles.logInToTheServiceAndReadResources'
          ),
          administrator: true,
          operator: true,
          readonly: true,
          noaccess: false,
        },
      ],
      fields: [
        { key: 'description', label: 'Privilege' },
        { key: 'administrator', label: 'Administrator', class: 'text-center' },
        { key: 'operator', label: 'Operator', class: 'text-center' },
        { key: 'readonly', label: 'ReadOnly', class: 'text-center' },
        { key: 'noaccess', label: 'NoAccess', class: 'text-center' },
      ],
    };
  },
};
</script>
