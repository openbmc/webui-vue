import store from '@/store';
import DumpsStore from '@/store/modules/Logs/DumpsStore';
import KeyClearStore from '@/store/modules/Operations/KeyClearStore';

store.unregisterModule('virtualMedia');

store.registerModule('dumps', DumpsStore);

store.registerModule('dumps', KeyClearStore);

export default store;
