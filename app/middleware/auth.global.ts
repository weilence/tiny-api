const anonymousRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/init'];

export default defineNuxtRouteMiddleware(async (to) => {
  if (anonymousRoutes.includes(to.path)) {
    const systemStatus = await http.get('/system/status');
    if (!systemStatus.initialized && to.path !== '/auth/init') {
      return navigateTo('/auth/init');
    } else if (systemStatus.initialized && to.path === '/auth/init') {
      return navigateTo('/auth/login');
    }

    return;
  }

  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn.value) {
    return navigateTo('/auth/login');
  }

  if (to.path.startsWith('/admin') && user.value?.role !== 'ADMIN') {
    return abortNavigation();
  }
});
