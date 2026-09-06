import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

const description = 'A customizable, i18n-ready, SSR-safe PDF viewer for Vue 3.'
const repo = 'https://github.com/hrynko/vue-pdfz'
const title = 'vue-pdfz'

export default defineConfig({
  title,
  description,
  head: [
    ['meta', { name: 'theme-color', content: '#42b883' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: title }],
    [
      'meta',
      {
        property: 'og:description',
        content: description,
      },
    ],
  ],
  lang: 'en-US',
  base: `/${title}/`,
  cleanUrls: true,
  srcExclude: ['**/_generated/**'],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API', link: '/api/props', activeMatch: '/api/' },
      { text: 'Demo', link: '/demo' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Styles & worker', link: '/guide/styles-and-worker' },
            { text: 'SSR & Nuxt', link: '/guide/ssr-nuxt' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Internationalization', link: '/guide/i18n' },
            { text: 'Theming', link: '/guide/theming' },
            { text: 'Customization', link: '/guide/customization' },
            { text: 'Keyboard shortcuts', link: '/guide/keyboard-shortcuts' },
            { text: 'Printing & download', link: '/guide/print-download' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'Component API',
          items: [
            { text: 'Props', link: '/api/props' },
            { text: 'Events', link: '/api/events' },
            { text: 'Methods', link: '/api/methods' },
            { text: 'Slots', link: '/api/slots' },
          ],
        },
        {
          text: 'Package API',
          items: [{ text: 'Plugin', link: '/api/plugin' }],
        },
      ],
    },

    socialLinks: [
      {
        icon: 'github',
        link: repo,
        ariaLabel: 'vue-pdfz on GitHub',
      },
      {
        icon: 'npm',
        link: 'https://npmjs.com/package/vue-pdfz',
        ariaLabel: 'vue-pdfz on npm',
      },
    ],

    editLink: {
      pattern: `${repo}/edit/main/packages/docs/:path`,
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },
  },

  vite: {
    resolve: {
      alias: [
        {
          find: 'vue-pdfz/style.css',
          replacement: fileURLToPath(
            new URL('../../vue-pdfz/src/theme/default.css', import.meta.url),
          ),
        },
        {
          find: /^vue-pdfz$/,
          replacement: fileURLToPath(new URL('../../vue-pdfz/src/index.ts', import.meta.url)),
        },
      ],
    },
  },
})
