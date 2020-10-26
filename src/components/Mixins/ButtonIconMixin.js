import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconChevron from '@carbon/icons-vue/es/chevron--up/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconFilter from '@carbon/icons-vue/es/settings--adjust/20';
import IconLaunch from '@carbon/icons-vue/es/launch/20';
import IconReplace from '@carbon/icons-vue/es/renew/20';
import IconSettings from '@carbon/icons-vue/es/settings/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';

const ButtonIconMixin = {
  components: {
    iconAdd: IconAdd,
    iconChevron: IconChevron,
    iconEdit: IconEdit,
    IconFilter: IconFilter,
    iconLaunch: IconLaunch,
    iconRefresh: IconReplace,
    iconReplace: IconReplace,
    iconSettings: IconSettings,
    iconDelete: IconTrashcan
  },
  data() {
    return {
      buttonIcons: [
        {
          id: 'add',
          icon: 'iconAdd'
        }
      ]
    };
  }
};

export default ButtonIconMixin;
