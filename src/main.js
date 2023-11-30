
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import "bootstrap";
import router from './router'
import {createBootstrap} from 'bootstrap-vue-next'

// Add the necessary CSS
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import i18n from './i18n'
import ArrowRight16 from '@carbon/icons-vue/es/arrow--right/16';

const pinia = createPinia();
const app = createApp(App);
app.use(pinia)
app.use(router)
app.component('IconArrowRight', ArrowRight16);
app.use(createBootstrap({components: true, directives: true})) // Change this line
app.use(i18n)

app.mount('#app')
