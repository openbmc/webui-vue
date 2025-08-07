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

import {
  BButton,
  BContainer,
  BForm,
  BFormGroup,
  BFormInput,
  BFormSelect,
  BFormFile,
  BFormCheckbox,
  BFormRadio,
  BFormText,
  BFormTextarea,
  BFormInvalidFeedback,
  BTable,
  BToast,
  BModal,
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
  BListGroup,
  BListGroupItem,
  BTabs,
  BTab,
  BLink,
} from 'bootstrap-vue-next';

const app = createApp(App);

app.component('BButton', BButton);
app.component('BBtn', BButton);
app.component('BContainer', BContainer);
app.component('BForm', BForm);
app.component('BFormGroup', BFormGroup);
app.component('BFormInput', BFormInput);
app.component('BFormSelect', BFormSelect);
app.component('BFormFile', BFormFile);
app.component('BFormCheckbox', BFormCheckbox);
app.component('BFormRadio', BFormRadio);
app.component('BFormText', BFormText);
app.component('BFormTextarea', BFormTextarea);
app.component('BFormInvalidFeedback', BFormInvalidFeedback);
app.component('BTable', BTable);
app.component('BToast', BToast);
app.component('BModal', BModal);
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
app.component('BListGroup', BListGroup);
app.component('BListGroupItem', BListGroupItem);
app.component('BTabs', BTabs);
app.component('BTab', BTab);
app.component('BLink', BLink);

app.use(i18n);
app.use(router);
app.use(store);

app.config.globalProperties.$eventBus = eventBus;

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
