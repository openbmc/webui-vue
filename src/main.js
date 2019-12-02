import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { dateFilter } from "vue-date-fns";
import {
  BadgePlugin,
  ButtonPlugin,
  CollapsePlugin,
  FormCheckboxPlugin,
  LayoutPlugin,
  LinkPlugin,
  ListGroupPlugin,
  ModalPlugin,
  NavbarPlugin,
  NavPlugin,
  TablePlugin
} from "bootstrap-vue";

Vue.filter("date", dateFilter);

Vue.use(BadgePlugin);
Vue.use(ButtonPlugin);
Vue.use(CollapsePlugin);
Vue.use(FormCheckboxPlugin);
Vue.use(LayoutPlugin);
Vue.use(LinkPlugin);
Vue.use(ListGroupPlugin);
Vue.use(ModalPlugin);
Vue.use(NavbarPlugin);
Vue.use(NavPlugin);
Vue.use(TablePlugin);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
