// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app/',

  // Nuxt ler as subpastas dos composables automaticamente
  imports: {
    dirs: [
      'composables/**'
    ]
  },

  devtools: { enabled: true },

  modules: [
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@vueuse/motion/nuxt'
  ],

  colorMode: {
    classSuffix: '', // Tailwind 'dark' puro (sem sufixo '-mode')
    preference: 'light',
    fallback: 'light',
    storageKey: 'nuxt-color-mode'
  },

  // Tailwind CSS via PostCSS diretamente — sem @nuxtjs/tailwindcss
  // Isso garante que o darkMode:'class' do tailwind.config.ts seja respeitado
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  typescript: {
    shim: false,
    strict: true,
    typeCheck: false
  },

  app: {
    head: {
      title: 'Conta Vinculada',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }
      ]
    },
    pageTransition: { name: 'fade-left', mode: 'out-in' },
    layoutTransition: false
  },

  css: [
    '@/assets/css/tailwind.css',
    '@/assets/global/animacoesGlobais.css'
  ],

  runtimeConfig: {
    dbServer: process.env.DB_SERVER,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT,
    public: {
      apiBase: process.env.API_BASE_URL || ''
    }
  },

  devServer: {
    port: 3000
  },

  compatibilityDate: '2025-07-15'
})