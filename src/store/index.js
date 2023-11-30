import { createPinia } from 'pinia';
import AuthenticationStore from './modules/Authentication/AuthenticationStore';
import EventLogStore from './modules/Logs/EventLogStore';
import GlobalStore from './modules/GlobalStore';
// import useWebSocketStore from './plugins/WebSocketPlugin';

const pinia = createPinia();

export const useStore = pinia.useStore; // Make sure to expose useStore

// Register your stores
pinia.use(AuthenticationStore);
pinia.use(EventLogStore);
pinia.use(GlobalStore);
// pinia.use(useWebSocketStore)

// ... (use other stores)

export default pinia;
