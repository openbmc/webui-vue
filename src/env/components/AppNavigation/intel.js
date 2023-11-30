import iconDashboard from '@carbon/icons-vue/es/dashboard/16';
import iconTextLinkAnalysis from '@carbon/icons-vue/es/text-link--analysis/16';
import iconDataCheck from '@carbon/icons-vue/es/data--check/16';
import iconSettings from '@carbon/icons-vue/es/settings/16';
import iconSecurity from '@carbon/icons-vue/es/security/16';
import iconDataBase from '@carbon/icons-vue/es/data--base--alt/16';
import i18n from '@/i18n';
const roles = {
  administrator: 'Administrator',
  operator: 'Operator',
  readonly: 'ReadOnly',
  noaccess: 'NoAccess',
};
export function AppNavigationData() {
  const navigationItems = [
    {
      id: 'overview',
      label: i18n.global.t('appNavigation.overview'),
      route: '/',
      icon: iconDashboard,
    },
    {
      id: 'logs',
      label: i18n.global.t('appNavigation.logs'),
      icon: iconTextLinkAnalysis,
      children: [
        {
          id: 'event-logs',
          label: i18n.global.t('appNavigation.eventLogs'),
          route: '/logs/event-logs',
        },
        {
          id: 'post-code-logs',
          label: i18n.global.t('appNavigation.postCodeLogs'),
          route: '/logs/post-code-logs',
        },
      ],
    },
    {
      id: 'hardware-status',
      label: i18n.global.t('appNavigation.hardwareStatus'),
      icon: iconDataCheck,
      children: [
        {
          id: 'inventory',
          label: i18n.global.t('appNavigation.inventory'),
          route: '/hardware-status/inventory',
        },
        {
          id: 'sensors',
          label: i18n.global.t('appNavigation.sensors'),
          route: '/hardware-status/sensors',
        },
      ],
    },
    {
      id: 'operations',
      label: i18n.global.t('appNavigation.operations'),
      icon: iconDataCheck,
      children: [
        {
          id: 'factory-reset',
          label: i18n.global.t('appNavigation.factoryReset'),
          route: '/operations/factory-reset',
        },
        {
          id: 'kvm',
          label: i18n.global.t('appNavigation.kvm'),
          route: '/operations/kvm',
        },
        {
          id: 'key-clear',
          label: i18n.global.t('appNavigation.keyClear'),
          route: '/operations/key-clear',
        },
        {
          id: 'firmware',
          label: i18n.global.t('appNavigation.firmware'),
          route: '/operations/firmware',
        },
        {
          id: 'reboot-bmc',
          label: i18n.global.t('appNavigation.rebootBmc'),
          route: '/operations/reboot-bmc',
        },
        {
          id: 'serial-over-lan',
          label: i18n.global.t('appNavigation.serialOverLan'),
          route: '/operations/serial-over-lan',
          exclusiveToRoles: [roles.administrator],
        },
        {
          id: 'server-power-operations',
          label: i18n.global.t('appNavigation.serverPowerOperations'),
          route: '/operations/server-power-operations',
        },
        {
          id: 'virtual-media',
          label: i18n.global.t('appNavigation.virtualMedia'),
          route: '/operations/virtual-media',
          exclusiveToRoles: [roles.administrator],
        },
      ],
    },
    {
      id: 'settings',
      label: i18n.global.t('appNavigation.settings'),
      icon: iconSettings,
      children: [
        {
          id: 'date-time',
          label: i18n.global.t('appNavigation.dateTime'),
          route: '/settings/date-time',
        },
        {
          id: 'network',
          label: i18n.global.t('appNavigation.network'),
          route: '/settings/network',
        },
        {
          id: 'power-restore-policy',
          label: i18n.global.t('appNavigation.powerRestorePolicy'),
          route: '/settings/power-restore-policy',
        },
        {
          id: 'snmp-alerts',
          label: i18n.global.t('appNavigation.snmpAlerts'),
          route: '/settings/snmp-alerts',
        },
      ],
    },
    // {
    //   id: 'security-and-access',
    //   label: i18n.global.t('appNavigation.securityAndAccess'),
    //   icon: iconSecurity,
    //   children: [
    //     {
    //       id: 'sessions',
    //       label: i18n.global.t('appNavigation.sessions'),
    //       route: '/security-and-access/sessions',
    //     },
    //     {
    //       id: 'ldap',
    //       label: i18n.global.t('appNavigation.ldap'),
    //       route: '/security-and-access/ldap',
    //     },
    //     {
    //       id: 'user-management',
    //       label: i18n.global.t('appNavigation.userManagement'),
    //       route: '/security-and-access/user-management',
    //     },
    //     {
    //       id: 'policies',
    //       label: i18n.global.t('appNavigation.policies'),
    //       route: '/security-and-access/policies',
    //     },
    //     {
    //       id: 'certificates',
    //       label: i18n.global.t('appNavigation.certificates'),
    //       route: '/security-and-access/certificates',
    //     },
    //   ],
    // },
    // {
    //   id: 'resource-management',
    //   label: i18n.global.t('appNavigation.resourceManagement'),
    //   icon: iconDataBase,
    //   children: [
    //     {
    //       id: 'power',
    //       label: i18n.global.t('appNavigation.power'),
    //       route: '/resource-management/power',
    //     },
    //   ],
    // },
  ];
  return {
    navigationItems,
  };
}
