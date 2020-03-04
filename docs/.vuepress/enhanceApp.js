
// OpenBMC Imports
import "../../src/assets/styles/_obmc-custom.scss";
import BVToastMixin from "../../src/components/Mixins/BVToastMixin";

// Bootstrap-vue Plugin imports
import {
    ButtonPlugin,
    ToastPlugin
  } from 'bootstrap-vue';


export default ({ Vue }) => {
      Vue.use(ButtonPlugin);
      Vue.use(ToastPlugin);

      // BMC Components and Mixins
      Vue.mixin('BVToastMixin', BVToastMixin);
}