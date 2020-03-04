import {
    AlertPlugin,
    ButtonPlugin
  } from 'bootstrap-vue';

export default ({ Vue }) => {
      Vue.use(AlertPlugin);
      Vue.use(ButtonPlugin);
}