import store from '@/store';
import DumpsStore from '@/store/modules/HardwareStatus/DumpsStore';

store.unregisterModule('virtualMedia');

store.registerModule('dumps', DumpsStore);

export default store;
