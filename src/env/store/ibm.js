import store from '@/store';
import KeyClearStore from '@/store/modules/Operations/KeyClearStore';

store.unregisterModule('virtualMedia');

store.registerModule('key-clear', KeyClearStore);

export default store;
