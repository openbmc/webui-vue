import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import {
  AlertPlugin,
  BadgePlugin,
  ButtonPlugin,
  BVConfigPlugin,
  CollapsePlugin,
  FormPlugin,
  FormCheckboxPlugin,
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
  TablePlugin,
  ToastPlugin,
  TooltipPlugin
} from 'bootstrap-vue';
import Vuelidate from 'vuelidate';
import i18n from './i18n';

// Filters
Vue.filter('formatDate', function(value) {
  const dateOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  if (value instanceof Date) {
    return value.toLocaleDateString(i18n.locale, dateOptions);
  }
});

Vue.filter('formatTime', function(value) {
  const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short'
  };
  if (value instanceof Date) {
    return value.toLocaleTimeString('default', timeOptions);
  }
});

// Plugins
Vue.use(AlertPlugin);
Vue.use(BadgePlugin);
Vue.use(ButtonPlugin);
Vue.use(BVConfigPlugin, {
  BFormText: { textVariant: 'secondary' },
  BTable: {
    headVariant: 'light',
    footVariant: 'light'
  },
  BFormTags: {
    tagVariant: 'primary',
    addButtonVariant: 'link-primary'
  }
});
Vue.use(CollapsePlugin);
Vue.use(FormPlugin);
Vue.use(FormCheckboxPlugin);
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
Vue.use(TablePlugin);
Vue.use(ToastPlugin);
Vue.use(TooltipPlugin);
Vue.use(Vuelidate);

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app');
