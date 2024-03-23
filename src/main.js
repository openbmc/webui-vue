import Vue from 'vue2';
import App from './App.vue';
import router from './router';
import createAppI18N from './i18n';

//Do not change store import.
//Exact match alias set to support
//dotenv customizations.
import { store } from './store';
//import eventBus from './eventBus';

import {
  AlertPlugin,
  BadgePlugin,
  BootstrapVue,
  ButtonPlugin,
  BVConfigPlugin,
  CardPlugin,
  CollapsePlugin,
  DropdownPlugin,
  FormPlugin,
  FormCheckboxPlugin,
  FormDatepickerPlugin,
  FormFilePlugin,
  FormGroupPlugin,
  FormInputPlugin,
  FormRadioPlugin,
  FormSelectPlugin,
  FormTagsPlugin,
  InputGroupPlugin,
  LayoutPlugin,
  LinkPlugin,
  ListGroupPlugin,
  ModalPlugin,
  NavbarPlugin,
  NavPlugin,
  PaginationPlugin,
  ProgressPlugin,
  TablePlugin,
  TabsPlugin,
  ToastPlugin,
  TooltipPlugin,
} from 'bootstrap-vue';
import applidate from '@vuelidate/core';
import { format } from 'date-fns-tz';

const i18n = createAppI18N;

//const app = createApp(App);

// Filters
Vue.filter('shortTimeZone', function (value) {
  const longTZ = value
    .toString()
    .match(/\((.*)\)/)
    .pop();
  const regexNotUpper = /[*a-z ]/g;
  return longTZ.replace(regexNotUpper, '');
});

Vue.filter('formatDate', function (value) {
  const isUtcDisplay = store.getters['global/isUtcDisplay'];

  if (value instanceof Date) {
    if (isUtcDisplay) {
      return value.toISOString().substring(0, 10);
    }
    const pattern = `yyyy-MM-dd`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return format(value, pattern, { timezone });
  }
});

Vue.filter('formatTime', function (value) {
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
    const shortTz = Vue.filter('shortTimeZone')(value);
    const pattern = `HH:mm:ss ('${shortTz}' O)`;
    return format(value, pattern, { timezone }).replace('GMT', 'UTC');
  }
});

Vue.use(store);
Vue.use(router);
Vue.use(i18n);

// Plugins
Vue.use(BootstrapVue);
Vue.use(AlertPlugin);
Vue.use(BadgePlugin);
Vue.use(ButtonPlugin);
Vue.use(BVConfigPlugin, {
  BFormText: { textVariant: 'secondary' },
  BTable: {
    headVariant: 'light',
    footVariant: 'light',
  },
  BFormTags: {
    tagVariant: 'primary',
    addButtonVariant: 'link-primary',
  },
  BBadge: {
    variant: 'primary',
  },
});

Vue.use(CardPlugin);
Vue.use(CollapsePlugin);
Vue.use(DropdownPlugin);
Vue.use(FormPlugin);
Vue.use(FormCheckboxPlugin);
Vue.use(FormDatepickerPlugin);
Vue.use(FormFilePlugin);
Vue.use(FormGroupPlugin);
Vue.use(FormInputPlugin);
Vue.use(FormRadioPlugin);
Vue.use(FormSelectPlugin);
Vue.use(FormTagsPlugin);
Vue.use(InputGroupPlugin);
Vue.use(LayoutPlugin);
Vue.use(LayoutPlugin);
Vue.use(LinkPlugin);
Vue.use(ListGroupPlugin);
Vue.use(ModalPlugin);
Vue.use(NavbarPlugin);
Vue.use(NavPlugin);
Vue.use(PaginationPlugin);
Vue.use(ProgressPlugin);
Vue.use(TablePlugin);
Vue.use(TabsPlugin);
Vue.use(ToastPlugin);
Vue.use(TooltipPlugin);
Vue.use(applidate);

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
//Vue.prototype.$eventBus = eventBus;
