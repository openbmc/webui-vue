import store from '@/store';
import DumpsStore from '@/store/modules/Logs/DumpsStore';
import KeyClearStore from '@/store/modules/Operations/KeyClearStore';

store.unregisterModule('virtualMedia');

store.registerModule('dumps', DumpsStore);

store.registerModule('key-clear', KeyClearStore);

export default store;
