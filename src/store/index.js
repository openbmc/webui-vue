import { createPinia } from 'pinia';
import EventLogStore from './modules/Logs/EventLogStore';
import GlobalStore from './modules/GlobalStore';

const pinia = createPinia();

export const useStore = pinia.useStore; // Make sure to expose useStore

// Register your stores
pinia.use(EventLogStore);
pinia.use(GlobalStore);

// ... (use other stores)

export default pinia;
