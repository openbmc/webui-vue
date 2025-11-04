import { createApp } from 'vue';

import App from './App.vue';
import i18n from './i18n';

import router from './router';

import { format } from 'date-fns-tz';

//Do not change store import.
//Exact match alias set to support
//dotenv customizations.
import store from './store';
import eventBus from './eventBus';
import { ToastPlugin } from './plugins/toast';

import {
  BButton,
  BContainer,
  BForm,
  BFormGroup,
  BFormInput,
  BFormCheckboxGroup,
  BInputGroup,
  BInputGroupText,
  BFormSelect,
  BFormSelectOption,
  BFormFile,
  BFormCheckbox,
  BFormRadioGroup,
  BFormRadio,
  BFormText,
  BFormTextarea,
  BFormTags,
  BFormInvalidFeedback,
  BTable,
  BToast,
  BModal,
  BCloseButton,
  BAlert,
  BCard,
  BCardHeader,
  BCardBody,
  BCardFooter,
  BCardGroup,
  BRow,
  BCol,
  BBadge,
  BSpinner,
  BDropdown,
  BDropdownItem,
  BNav,
  BNavbar,
  BNavbarBrand,
  BNavbarNav,
  BNavItem,
  BNavbarToggle,
  BCollapse,
  BPagination,
  BTooltip,
  BPopover,
  BProgress,
  BProgressBar,
  BOverlay,
  BListGroup,
  BListGroupItem,
  BTabs,
  BTab,
  BLink,
  BOrchestrator,
  createBootstrap,
  vBToggle,
  vBTooltip,
  vBPopover,
  vBModal,
} from 'bootstrap-vue-next';

const app = createApp(App);

// Note: We register only the components/directives we need

// Use createBootstrap for all bootstrap-vue-next plugins in 0.40.7+
app.use(createBootstrap());

app.component('BButton', BButton);
app.component('BBtn', BButton);
app.component('BContainer', BContainer);
app.component('BForm', BForm);
app.component('BFormGroup', BFormGroup);
app.component('BFormInput', BFormInput);
app.component('BFormCheckboxGroup', BFormCheckboxGroup);
app.component('BInputGroup', BInputGroup);
app.component('BInputGroupText', BInputGroupText);
app.component('BFormSelect', BFormSelect);
app.component('BFormSelectOption', BFormSelectOption);
app.component('BFormFile', BFormFile);
app.component('BFormCheckbox', BFormCheckbox);
app.component('BFormRadioGroup', BFormRadioGroup);
app.component('BFormRadio', BFormRadio);
app.component('BFormText', BFormText);
app.component('BFormTextarea', BFormTextarea);
app.component('BFormTags', BFormTags);
app.component('BFormInvalidFeedback', BFormInvalidFeedback);
app.component('BTable', BTable);
app.component('BToast', BToast);
app.component('BModal', BModal);
app.component('BCloseButton', BCloseButton);
app.component('BAlert', BAlert);
app.component('BCard', BCard);
app.component('BCardHeader', BCardHeader);
app.component('BCardBody', BCardBody);
app.component('BCardFooter', BCardFooter);
app.component('BCardGroup', BCardGroup);
app.component('BRow', BRow);
app.component('BCol', BCol);
app.component('BBadge', BBadge);
app.component('BSpinner', BSpinner);
app.component('BDropdown', BDropdown);
app.component('BDropdownItem', BDropdownItem);
app.component('BNav', BNav);
app.component('BNavbar', BNavbar);
app.component('BNavbarBrand', BNavbarBrand);
app.component('BNavbarNav', BNavbarNav);
app.component('BNavItem', BNavItem);
app.component('BNavbarToggle', BNavbarToggle);
app.component('BCollapse', BCollapse);
app.component('BPagination', BPagination);
app.component('BTooltip', BTooltip);
app.component('BPopover', BPopover);
app.component('BProgress', BProgress);
app.component('BProgressBar', BProgressBar);
app.component('BOverlay', BOverlay);
app.component('BListGroup', BListGroup);
app.component('BListGroupItem', BListGroupItem);
app.component('BTabs', BTabs);
app.component('BTab', BTab);
app.component('BLink', BLink);
app.component('BOrchestrator', BOrchestrator);

// Register BootstrapVue Next directives used in templates
app.directive('b-toggle', vBToggle);
app.directive('b-tooltip', vBTooltip);
app.directive('b-popover', vBPopover);
app.directive('b-modal', vBModal);

app.use(i18n);
app.use(router);
app.use(store);
app.use(ToastPlugin);

app.config.globalProperties.$eventBus = eventBus;
app.config.globalProperties.$confirm = (messageOrOptions) => {
  return new Promise((resolve) => {
    eventBus.$emit('confirm:open', {
      ...(typeof messageOrOptions === 'string'
        ? { message: messageOrOptions }
        : messageOrOptions),
      resolve,
    });
  });
};

//Filters
const filter = {
  formatDate(value) {
    const isUtcDisplay = store.getters['global/isUtcDisplay'];

    if (value instanceof Date) {
      if (isUtcDisplay) {
        return value.toISOString().substring(0, 10);
      }
      const pattern = `yyyy-MM-dd`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return format(value, pattern, { timezone });
    }
  },
  formatTime(value) {
    const isUtcDisplay = store.getters['global/isUtcDisplay'];

    if (value instanceof Date) {
      if (isUtcDisplay) {
        let timeOptions = {
          timeZone: 'UTC',
          hourCycle: 'h23',
        };
        return `${value.toLocaleTimeString('default', timeOptions)} UTC`;
      }
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const shortTz = this.shortTimeZone(value);
      const pattern = `HH:mm:ss ('${shortTz}' O)`;
      return format(value, pattern, { timezone }).replace('GMT', 'UTC');
    }
  },
  shortTimeZone(value) {
    const longTZ = value
      .toString()
      .match(/\((.*)\)/)
      .pop();
    const regexNotUpper = /[*a-z ]/g;
    return longTZ.replace(regexNotUpper, '');
  },
};
app.config.globalProperties.$filters = filter;

app.mount('#app');
