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

import './assets/styles/bmc/helpers/_index.scss';
import './assets/styles/bootstrap/_helpers.scss';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import {
  BootstrapVue,
  AlertPlugin,
  BadgePlugin,
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

const app = createApp({
  router,
  store,
  render: (h) => h(App),
});
app.use(i18n);

app.use(router);
app.use(store);

// Plugins
app.use(BootstrapVue);
app.use(AlertPlugin);
app.use(BadgePlugin);
app.use(ButtonPlugin);
app.use(BVConfigPlugin, {
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

app.use(CardPlugin);
app.use(CollapsePlugin);
app.use(DropdownPlugin);
app.use(FormPlugin);
app.use(FormCheckboxPlugin);
app.use(FormDatepickerPlugin);
app.use(FormFilePlugin);
app.use(FormGroupPlugin);
app.use(FormInputPlugin);
app.use(FormRadioPlugin);
app.use(FormSelectPlugin);
app.use(FormTagsPlugin);
app.use(InputGroupPlugin);
app.use(LayoutPlugin);
app.use(LayoutPlugin);
app.use(LinkPlugin);
app.use(ListGroupPlugin);
app.use(ModalPlugin);
app.use(NavbarPlugin);
app.use(NavPlugin);
app.use(PaginationPlugin);
app.use(ProgressPlugin);
app.use(TablePlugin);
app.use(TabsPlugin);
app.use(ToastPlugin);
app.use(TooltipPlugin);

app.mount('#app');
app.prototype.$eventBus = eventBus;
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
