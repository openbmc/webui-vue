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
import i18n from '@/i18n';

export default {
  components: {
    Checkmark20,
  },
  data() {
    return {
      items: [
        {
          description: i18n.global.t(
            'pageUserManagement.tableRoles.configureComponentsManagedByThisService',
          ),
          administrator: true,
          operator: true,
          readonly: false,
          noaccess: false,
        },
        {
          description: i18n.global.t(
            'pageUserManagement.tableRoles.configureManagerResources',
          ),
          administrator: true,
          operator: false,
          readonly: false,
          noaccess: false,
        },
        {
          description: i18n.global.t(
            'pageUserManagement.tableRoles.updatePasswordForCurrentUserAccount',
          ),
          administrator: true,
          operator: true,
          readonly: true,
          noaccess: false,
        },
        {
          description: i18n.global.t(
            'pageUserManagement.tableRoles.configureUsersAndTheirAccounts',
          ),
          administrator: true,
          operator: false,
          readonly: false,
          noaccess: false,
        },
        {
          description: i18n.global.t(
            'pageUserManagement.tableRoles.logInToTheServiceAndReadResources',
          ),
          administrator: true,
          operator: true,
          readonly: true,
          noaccess: false,
        },
      ],
      fields: [
        {
          key: 'description',
          label: i18n.global.t('pageUserManagement.tableRoles.privilege'),
        },
        {
          key: 'administrator',
          label: i18n.global.t('pageUserManagement.tableRoles.administrator'),
          class: 'text-center',
        },
        {
          key: 'operator',
          label: i18n.global.t('pageUserManagement.tableRoles.operator'),
          class: 'text-center',
        },
        {
          key: 'readonly',
          label: i18n.global.t('pageUserManagement.tableRoles.readOnly'),
          class: 'text-center',
        },
        {
          key: 'noaccess',
          label: i18n.global.t('pageUserManagement.tableRoles.noAccess'),
          class: 'text-center',
        },
      ],
    };
  },
};
</script>
