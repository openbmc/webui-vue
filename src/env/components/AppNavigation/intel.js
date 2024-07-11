import IconDashboard from '@carbon/icons-vue/es/dashboard/16';
import IconTextLinkAnalysis from '@carbon/icons-vue/es/text-link--analysis/16';
import IconDataCheck from '@carbon/icons-vue/es/data--check/16';
import IconSettingsAdjust from '@carbon/icons-vue/es/settings--adjust/16';
import IconSettings from '@carbon/icons-vue/es/settings/16';
import IconSecurity from '@carbon/icons-vue/es/security/16';
import IconChevronUp from '@carbon/icons-vue/es/chevron--up/16';
import IconDataBase from '@carbon/icons-vue/es/data--base--alt/16';
import i18n from '@/i18n';

const roles = {
  administrator: 'Administrator',
  operator: 'Operator',
  readonly: 'ReadOnly',
  noaccess: 'NoAccess',
};

const AppNavigationMixin = {
  components: {
    iconOverview: IconDashboard,
    iconLogs: IconTextLinkAnalysis,
    iconHealth: IconDataCheck,
    iconControl: IconSettingsAdjust,
    iconSettings: IconSettings,
    iconSecurityAndAccess: IconSecurity,
    iconExpand: IconChevronUp,
    iconResourceManagement: IconDataBase,
  },
  data() {
    return {
      navigationItems: [
        {
          id: 'overview',
          label: i18n.global.t('appNavigation.overview'),
          route: '/',
          icon: 'iconOverview',
        },
        {
          id: 'logs',
          label: i18n.global.t('appNavigation.logs'),
          icon: 'iconLogs',
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
          icon: 'iconHealth',
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
          icon: 'iconControl',
          children: [
            {
              id: 'kvm',
              label: i18n.global.t('appNavigation.kvm'),
              route: '/operations/kvm',
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
          icon: 'iconSettings',
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
          ],
        },
        {
          id: 'security-and-access',
          label: i18n.global.t('appNavigation.securityAndAccess'),
          icon: 'iconSecurityAndAccess',
          children: [
            {
              id: 'sessions',
              label: i18n.global.t('appNavigation.sessions'),
              route: '/security-and-access/sessions',
            },
            {
              id: 'user-management',
              label: i18n.global.t('appNavigation.userManagement'),
              route: '/security-and-access/user-management',
            },
            {
              id: 'policies',
              label: i18n.global.t('appNavigation.policies'),
              route: '/security-and-access/policies',
            },
            {
              id: 'certificates',
              label: i18n.global.t('appNavigation.certificates'),
              route: '/security-and-access/certificates',
            },
          ],
        },
        {
          id: 'resource-management',
          label: i18n.global.t('appNavigation.resourceManagement'),
          icon: 'iconResourceManagement',
          children: [
            {
              id: 'power',
              label: i18n.global.t('appNavigation.power'),
              route: '/resource-management/power',
            },
          ],
        },
      ],
    };
  },
};

export default AppNavigationMixin;
