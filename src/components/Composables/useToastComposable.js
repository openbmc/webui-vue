import { h } from 'vue';
import i18n from '@/i18n';
import {useToast} from 'bootstrap-vue-next';
import Toast from '../Global/Toast.vue'; // Need to be removed when styling library is changed
const useToastComposable = () => {
  const {show} = useToast();
  const initToast = (title,body, statusPassed, timestamp,refreshAction) => {
    show?.({
      component: h(Toast, {
        title: title,
        body: body,
        statusPassed: statusPassed,
        pos: 'top-right',
        autoHideDelay: 200000,
        autoHide: true,
        timestamp: timestamp,
        refreshAction: refreshAction,
      }),
    });
  };
  const successToast = (message, { title: t =  i18n.global.t('global.status.Success'),timestamp,refreshAction} = {}) => {  
    initToast( t, message, 'success', timestamp,refreshAction);
  };
  const errorToast = ( message, { title: t = i18n.global.t('global.status.Error'),timestamp,refreshAction} = {}) => {
    initToast( t, message, 'danger', timestamp,refreshAction);
  };
  const warningToast = (message, { title: t = i18n.global.t('global.status.warning'), timestamp,refreshAction,} = {})=> {
    initToast( t, message, 'warning', timestamp,refreshAction);
  };
  const infoToast = ( message, { title: t = i18n.global.t('global.status.informational'),timestamp,refreshAction,} = {}) => {
    initToast( t, message, 'info', timestamp,refreshAction);
  };

  return {
    successToast,
    errorToast,
    warningToast,
    infoToast
  };
};

export default useToastComposable;
