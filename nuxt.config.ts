// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/image', '@nuxt/test-utils', 'reka-ui/nuxt', 'h3-valibot/nuxt'],

  pages: {
    pattern: ['**/*.vue', '!**/components/**'],
  },

  css: ['~/assets/css/main.css'],

  ui: {
    fonts: false,
  },

  vite: {
    optimizeDeps: {
      include: [
        'reka-ui',
        '@vue/devtools-core',
        '@vueuse/core',
        '@vue/devtools-kit',
        'valibot',
        '@internationalized/date',
      ],
    },
  },

  ssr: false,

  runtimeConfig: {
    public: {},
    databaseUrl: '',
    redis: {
      host: '127.0.0.1',
      port: 6379,
      password: '',
      db: 0,
    },
  },
});
