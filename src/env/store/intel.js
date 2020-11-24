import store from '@/store';

// Use store.registerModule() to register env specific
// store modules
// https://vuex.vuejs.org/api/#registermodule

store.unregisterModule('ldap');

export default store;
