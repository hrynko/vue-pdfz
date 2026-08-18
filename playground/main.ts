import { createApp } from 'vue'
import VuePdfz from 'vue-pdfz'

import 'vue-pdfz/style.css'

import App from './App.vue'

import './styles.css'

createApp(App).use(VuePdfz, { locale: 'en' }).mount('#app')
