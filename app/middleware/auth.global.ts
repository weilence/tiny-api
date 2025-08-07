// 认证中间件
export default defineNuxtRouteMiddleware((to) => {
  // 检查是否需要认证的路由
  // 这里可以根据你的需求来定义哪些路由需要登录
  const anonymousRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/init'];
  if (anonymousRoutes.includes(to.path)) {
    return;
  }

  const { isLoggedIn } = useAuth();
  if (!isLoggedIn.value) {
    return navigateTo('/auth/login');
  }
});
