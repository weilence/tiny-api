export default defineNuxtRouteMiddleware(() => {
  const { user, isLoggedIn } = useAuth();

  // 检查是否已登录
  if (!isLoggedIn.value) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please login first',
    });
  }

  // 检查用户权限
  if (user.value?.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - Admin access required',
    });
  }
});
