import store from '@/store';
import FirmwareSingleImageStore from './FirmwareSingleImage/FirmwareSingleImageStore';
import DumpsStore from './Dumps/DumpsStore';

store.unregisterModule('virtualMedia');

store.unregisterModule('firmware');
store.registerModule('firmwareSingleImage', FirmwareSingleImageStore);
store.registerModule('dumps', DumpsStore);

export default store;
