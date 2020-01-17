import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Axios from "axios";
import {
  ButtonPlugin,
  CollapsePlugin,
  LayoutPlugin,
  LinkPlugin,
  ModalPlugin,
  NavbarPlugin,
  NavPlugin,
  TablePlugin
} from "bootstrap-vue";

Vue.use(LayoutPlugin);
Vue.use(ButtonPlugin);
Vue.use(CollapsePlugin);
Vue.use(LinkPlugin);
Vue.use(ModalPlugin);
Vue.use(NavbarPlugin);
Vue.use(NavPlugin);
Vue.use(TablePlugin);

Vue.prototype.$http = Axios;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
