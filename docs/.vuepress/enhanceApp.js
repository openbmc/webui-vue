// OpenBMC Imports
import "../../src/assets/styles/_obmc-custom.scss";
import Alert from "../../src/components/Global/Alert";

// Bootstrap-vue Plugin imports
import {
    AlertPlugin,
    ButtonPlugin
  } from 'bootstrap-vue';


export default ({ Vue }) => {
      Vue.use(AlertPlugin);
      Vue.use(ButtonPlugin);

      // BMC Components and Mixins
      Vue.component('Alert', Alert);
}