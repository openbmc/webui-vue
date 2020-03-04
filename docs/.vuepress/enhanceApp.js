import {
    AlertPlugin,
    ButtonPlugin,
    ToastPlugin
  } from 'bootstrap-vue';

export default ({ Vue }) => {
      Vue.use(AlertPlugin);
      Vue.use(ButtonPlugin);
      Vue.use(ToastPlugin);
}