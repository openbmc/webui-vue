import store from '@/store';
import DumpsStore from '@/store/modules/Logs/DumpsStore';

store.unregisterModule('virtualMedia');

store.registerModule('dumps', DumpsStore);

export default store;
