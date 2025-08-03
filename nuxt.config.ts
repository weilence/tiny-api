// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/image', '@nuxt/test-utils', 'reka-ui/nuxt'],

  pages: {
    pattern: ['**/*.vue', '!**/components/**'],
  },

  css: ['~/assets/css/main.css'],

  ui: {
    fonts: false,
  },

  ssr: false,

  nitro: {
    storage: {
      redis: {
        driver: 'redis',
        host: process.env.REDIS_HOST,
      },
    },
  },

  runtimeConfig: {
    public: {
      allowRegister: false,
    },
  },
});
