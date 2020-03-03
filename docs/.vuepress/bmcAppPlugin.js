import "../../src/assets/styles/_obmc-custom.scss";
import Alert from '../../src/components/Global/Alert';

export default {
    install (Vue, options) {
        Vue.component('Alert', Alert);
    }
}