// 认证插件，在应用启动时初始化用户状态
export default defineNuxtPlugin(() => {
  const { initializeAuth } = useAuth();
  initializeAuth();
});
