export default defineNuxtPlugin(() => {
  const { token, logout } = useAuth();

  const api = $fetch.create({
    onRequest({ options }) {
      if (token.value) {
        // note that this relies on ofetch >= 1.4.0 - you may need to refresh your lockfile
        options.headers.set('Authorization', `Token ${token.value}`);
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        await logout();
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
