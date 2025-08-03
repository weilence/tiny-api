// 认证中间件
export default defineNuxtRouteMiddleware((to) => {
  // 检查是否需要认证的路由
  // 这里可以根据你的需求来定义哪些路由需要登录
  const anonymousRoutes = ['/auth/login', '/auth/register', '/init'];
  if (anonymousRoutes.includes(to.path)) {
    return;
  }

  const isLoggedIn = localStorage.getItem('user_token');
  if (!isLoggedIn) {
    return navigateTo('/auth/login');
  }
});
