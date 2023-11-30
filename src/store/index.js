import { createPinia } from 'pinia';
import AuthenticationStore from './modules/Authentication/AuthenticationStore';

const pinia = createPinia();

export const useStore = pinia.useStore; // Make sure to expose useStore

// Register your stores
pinia.use(AuthenticationStore);
// ... (use other stores)

export default pinia;
