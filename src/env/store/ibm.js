import store from '@/store';
import DumpsStore from '@/store/modules/Health/DumpsStore';

store.unregisterModule('virtualMedia');

store.registerModule('dumps', DumpsStore);

export default store;
