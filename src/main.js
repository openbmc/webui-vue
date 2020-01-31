import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { dateFilter } from 'vue-date-fns';
import {
  AlertPlugin,
  BadgePlugin,
  ButtonPlugin,
  BVConfigPlugin,
  CollapsePlugin,
  FormPlugin,
  FormCheckboxPlugin,
  FormGroupPlugin,
  FormInputPlugin,
  FormRadioPlugin,
  FormSelectPlugin,
  LayoutPlugin,
  LinkPlugin,
  ListGroupPlugin,
  ModalPlugin,
  NavbarPlugin,
  NavPlugin,
  TablePlugin,
  ToastPlugin
} from 'bootstrap-vue';
import Vuelidate from 'vuelidate';
import i18n from './i18n';

Vue.filter('date', dateFilter);

Vue.use(AlertPlugin);
Vue.use(BadgePlugin);
Vue.use(ButtonPlugin);
Vue.use(BVConfigPlugin, {
  BFormText: { textVariant: 'black' },
  BTable: {
    headVariant: 'light',
    footVariant: 'light'
  }
});
Vue.use(CollapsePlugin);
Vue.use(FormPlugin);
Vue.use(FormCheckboxPlugin);
Vue.use(FormGroupPlugin);
Vue.use(FormInputPlugin);
Vue.use(FormRadioPlugin);
Vue.use(FormSelectPlugin);
Vue.use(LayoutPlugin);
Vue.use(LayoutPlugin);
Vue.use(LinkPlugin);
Vue.use(ListGroupPlugin);
Vue.use(ModalPlugin);
Vue.use(NavbarPlugin);
Vue.use(NavPlugin);
Vue.use(TablePlugin);
Vue.use(ToastPlugin);
Vue.use(Vuelidate);

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app');
