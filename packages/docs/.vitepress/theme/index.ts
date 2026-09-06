import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import 'vue-pdfz/style.css'

import DemoViewer from './components/DemoViewer.vue'
import HeroViewer from './components/HeroViewer.vue'
import LiveEditor from './components/LiveEditor.vue'

import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(HeroViewer),
    }),
  enhanceApp({ app }) {
    app.component('DemoViewer', DemoViewer)
    app.component('LiveEditor', LiveEditor)
  },
} satisfies Theme
