import store from '@/store';
import FirmwareSingleImageStore from './FirmwareSingleImage/FirmwareSingleImageStore';

store.unregisterModule('virtualMedia');

store.unregisterModule('firmware');
store.registerModule('firmwareSingleImage', FirmwareSingleImageStore);

export default store;
