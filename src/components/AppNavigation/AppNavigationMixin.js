import IconDashboard from '@carbon/icons-vue/es/dashboard/16';
import IconTextLinkAnalysis from '@carbon/icons-vue/es/text-link--analysis/16';
import IconDataCheck from '@carbon/icons-vue/es/data--check/16';
import IconSettingsAdjust from '@carbon/icons-vue/es/settings--adjust/16';
import IconSettings from '@carbon/icons-vue/es/settings/16';
import IconPassword from '@carbon/icons-vue/es/password/16';
import IconChevronUp from '@carbon/icons-vue/es/chevron--up/16';

const AppNavigationMixin = {
  components: {
    iconOverview: IconDashboard,
    iconLogs: IconTextLinkAnalysis,
    iconHealth: IconDataCheck,
    iconControl: IconSettingsAdjust,
    iconSettings: IconSettings,
    iconAccessControl: IconPassword,
    iconExpand: IconChevronUp,
  },
  data() {
    return {
      navigationItems: [
        {
          id: 'overview',
          label: this.$t('appNavigation.overview'),
          route: '/',
          icon: 'iconOverview',
        },
        {
          id: 'logs',
          label: this.$t('appNavigation.logs'),
          icon: 'iconLogs',
          children: [
            {
              id: 'event-logs',
              label: this.$t('appNavigation.eventLogs'),
              route: '/logs/event-logs',
            },
            {
              id: 'post-code-logs',
              label: this.$t('appNavigation.postCodeLogs'),
              route: '/logs/post-code-logs',
            },
          ],
        },
        {
          id: 'hardware-status',
          label: this.$t('appNavigation.hardwareStatus'),
          icon: 'iconHealth',
          children: [
            {
              id: 'inventory',
              label: this.$t('appNavigation.inventory'),
              route: '/hardware-status/inventory',
            },
            {
              id: 'sensors',
              label: this.$t('appNavigation.sensors'),
              route: '/hardware-status/sensors',
            },
          ],
        },
        {
          id: 'operations',
          label: this.$t('appNavigation.operations'),
          icon: 'iconControl',
          children: [
            {
              id: 'factory-reset',
              label: this.$t('appNavigation.factoryReset'),
              route: '/operations/factory-reset',
            },
            {
              id: 'kvm',
              label: this.$t('appNavigation.kvm'),
              route: '/operations/kvm',
            },
            {
              id: 'firmware',
              label: this.$t('appNavigation.firmware'),
              route: '/operations/firmware',
            },
            {
              id: 'manage-power-usage',
              label: this.$t('appNavigation.managePowerUsage'),
              route: '/operations/manage-power-usage',
            },
            {
              id: 'reboot-bmc',
              label: this.$t('appNavigation.rebootBmc'),
              route: '/operations/reboot-bmc',
            },
            {
              id: 'serial-over-lan',
              label: this.$t('appNavigation.serialOverLan'),
              route: '/operations/serial-over-lan',
            },
            {
              id: 'server-power-operations',
              label: this.$t('appNavigation.serverPowerOperations'),
              route: '/operations/server-power-operations',
            },
            {
              id: 'virtual-media',
              label: this.$t('appNavigation.virtualMedia'),
              route: '/operations/virtual-media',
            },
          ],
        },
        {
          id: 'settings',
          label: this.$t('appNavigation.settings'),
          icon: 'iconSettings',
          children: [
            {
              id: 'date-time',
              label: this.$t('appNavigation.dateTime'),
              route: '/settings/date-time',
            },
            {
              id: 'network',
              label: this.$t('appNavigation.network'),
              route: '/settings/network',
            },
            {
              id: 'power-restore-policy',
              label: this.$t('appNavigation.powerRestorePolicy'),
              route: '/settings/power-restore-policy',
            },
            {
              id: 'security-settings',
              label: this.$t('appNavigation.securitySettings'),
              route: '/settings/security-settings',
            },
          ],
        },
        {
          id: 'access-control',
          label: this.$t('appNavigation.accessControl'),
          icon: 'iconAccessControl',
          children: [
            {
              id: 'client-sessions',
              label: this.$t('appNavigation.clientSessions'),
              route: '/access-control/client-sessions',
            },
            {
              id: 'ldap',
              label: this.$t('appNavigation.ldap'),
              route: '/access-control/ldap',
            },
            {
              id: 'local-user-management',
              label: this.$t('appNavigation.localUserManagement'),
              route: '/access-control/local-user-management',
            },
            {
              id: 'ssl-certificates',
              label: this.$t('appNavigation.sslCertificates'),
              route: '/access-control/ssl-certificates',
            },
          ],
        },
      ],
    };
  },
};

export default AppNavigationMixin;
