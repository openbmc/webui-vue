
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import BootstrapVueNext from 'bootstrap-vue-next'
import i18n from './i18n'
import ArrowRight16 from '@carbon/icons-vue/es/arrow--right/16';

const pinia = createPinia();
const app = createApp(App)

app.component('IconArrowRight', ArrowRight16);
app.use(pinia)
app.use(router)
app.use(BootstrapVueNext)
app.use(i18n)

app.mount('#app')
