import {
    AlertPlugin,
    ButtonPlugin
  } from 'bootstrap-vue';

import BmcAppPlugin from './bmcAppPlugin';

export default ({ Vue }) => {
      Vue.use(AlertPlugin);
      Vue.use(ButtonPlugin);
      Vue.use(BmcAppPlugin);
}