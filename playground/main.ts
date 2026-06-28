import { createApp } from 'vue'
import VuePdfx from 'vue-pdfx'

import 'vue-pdfx/style.css'

import App from './App.vue'

import './styles.css'

createApp(App).use(VuePdfx, { locale: 'en' }).mount('#app')
