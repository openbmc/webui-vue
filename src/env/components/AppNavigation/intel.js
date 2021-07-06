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
    iconConfiguration: IconSettings,
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
          ],
        },
        {
          id: 'hardware-status',
          label: this.$t('appNavigation.hardwareStatus'),
          icon: 'iconHealth',
          children: [
            {
              id: 'inventory-and-leds',
              label: this.$t('appNavigation.inventoryAndLeds'),
              route: '/hardware-status/inventory-and-leds',
            },
            {
              id: 'sensors',
              label: this.$t('appNavigation.sensors'),
              route: '/hardware-status/sensors',
            },
            {
              id: 'server-led',
              label: this.$t('appNavigation.serverLed'),
              route: '/control/server-led',
            },
          ],
        },
        {
          id: 'control',
          label: this.$t('appNavigation.control'),
          icon: 'iconControl',
          children: [
            {
              id: 'kvm',
              label: this.$t('appNavigation.kvm'),
              route: '/control/kvm',
            },
            {
              id: 'manage-power-usage',
              label: this.$t('appNavigation.managePowerUsage'),
              route: '/control/manage-power-usage',
            },
            {
              id: 'reboot-bmc',
              label: this.$t('appNavigation.rebootBmc'),
              route: '/control/reboot-bmc',
            },
            {
              id: 'serial-over-lan',
              label: this.$t('appNavigation.serialOverLan'),
              route: '/control/serial-over-lan',
            },
            {
              id: 'server-power-operations',
              label: this.$t('appNavigation.serverPowerOperations'),
              route: '/control/server-power-operations',
            },
            {
              id: 'virtual-media',
              label: this.$t('appNavigation.virtualMedia'),
              route: '/control/virtual-media',
            },
          ],
        },
        {
          id: 'configuration',
          label: this.$t('appNavigation.configuration'),
          icon: 'iconConfiguration',
          children: [
            {
              id: 'date-time-settings',
              label: this.$t('appNavigation.dateTimeSettings'),
              route: '/configuration/date-time-settings',
            },
            {
              id: 'firmware',
              label: this.$t('appNavigation.firmware'),
              route: '/configuration/firmware',
            },
            {
              id: 'network-settings',
              label: this.$t('appNavigation.networkSettings'),
              route: '/configuration/network-settings',
            },
            {
              id: 'security-settings',
              label: this.$t('appNavigation.securitySettings'),
              route: '/configuration/security-settings',
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
