import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuelidate from 'vuelidate';
import {
  AlertPlugin,
  ButtonPlugin,
  FormPlugin,
  FormGroupPlugin,
  FormInputPlugin,
  FormSelectPlugin,
  LayoutPlugin
} from 'bootstrap-vue';

import App from '@/App';
import i18n from '@/i18n';
import LoginLayout from '@/layouts/LoginLayout';
import Login from './Login';

const routes = [
  {
    path: '/',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: Login,
        meta: {
          title: 'appPageTitle.login'
        }
      }
    ]
  }
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
});

Vue.use(VueRouter);
Vue.use(Vuelidate);
Vue.use(AlertPlugin);
Vue.use(ButtonPlugin);
Vue.use(FormPlugin);
Vue.use(FormGroupPlugin);
Vue.use(FormInputPlugin);
Vue.use(FormSelectPlugin);
Vue.use(LayoutPlugin);

new Vue({
  i18n,
  router,
  render: h => h(App)
}).$mount('#app');
