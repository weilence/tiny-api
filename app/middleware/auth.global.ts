const anonymousRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/init'];

export default defineNuxtRouteMiddleware(async (to) => {
  if (anonymousRoutes.includes(to.path)) {
    const { settings } = useSettings();
    if (!settings.value?.initialized && to.path !== '/auth/init') {
      return navigateTo('/auth/init');
    } else if (settings.value?.initialized && to.path === '/auth/init') {
      return navigateTo('/auth/login');
    }

    return;
  }

  const { user } = useAuth();
  if (user.value === null) {
    return navigateTo('/auth/login');
  }

  if (to.path.startsWith('/admin') && user.value?.role !== 'ADMIN') {
    return abortNavigation();
  }
});
