import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconArrowDown from '@carbon/icons-vue/es/arrow--down/16';
import IconChevron from '@carbon/icons-vue/es/chevron--up/20';
import IconLaunch from '@carbon/icons-vue/es/launch/20';
import IconSettings from '@carbon/icons-vue/es/settings/20';
import IconSwitch from '@carbon/icons-vue/es/arrows--horizontal/20';

const ButtonActionMixin = {
  components: {
    IconAdd,
    IconArrowDown,
    IconChevron,
    IconLaunch,
    IconSettings,
    IconSwitch,
  },
  data() {
    return {
      buttonActions: [
        {
          id: 'add',
          icon: 'IconAdd',
        },
        {
          id: 'chevron',
          icon: 'IconChevron',
        },
        {
          id: 'down',
          icon: 'IconArrowDown',
        },
        {
          id: 'launch',
          icon: 'IconLaunch',
        },
        {
          id: 'settings',
          icon: 'IconSettings',
        },
        {
          id: 'switch',
          icon: 'IconSwitch',
        },
      ],
    };
  },
};

export default ButtonActionMixin;
