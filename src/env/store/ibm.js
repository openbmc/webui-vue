import store from '@/store';
import DumpsStore from './Dumps/DumpsStore';

store.unregisterModule('virtualMedia');

store.registerModule('dumps', DumpsStore);

export default store;
