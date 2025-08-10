export const baseURL = '/api';

export default defineNuxtPlugin((nuxtApp) => {
  const { token, clearAuth } = useAuth();
  const overlay = useOverlay();

  const api = $fetch.create({
    baseURL: baseURL,
    onRequest({ options }) {
      if (token.value) {
        // note that this relies on ofetch >= 1.4.0 - you may need to refresh your lockfile
        options.headers.set('Authorization', `Token ${token.value}`);
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        clearAuth();
        overlay.closeAll();
        await nuxtApp.runWithContext(() => navigateTo('/auth/login'));
      }
    },
  });

  // Expose to useNuxtApp().$api
  return {
    provide: {
      api,
    },
  };
});
