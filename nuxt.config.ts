// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/image', '@nuxt/test-utils', 'h3-valibot/nuxt'],

  pages: {
    pattern: ['**/*.vue', '!**/components/**'],
  },

  css: ['~/assets/css/main.css'],

  ui: {
    fonts: false,
  },

  ssr: false,

  runtimeConfig: {
    public: {
      allowRegister: true,
    },
    databaseUrl: 'postgresql://postgres:123456@localhost:5432/api-doc',
    redisUrl: 'redis://localhost:6379',
  },
});
