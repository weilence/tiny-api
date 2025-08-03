export default defineNuxtRouteMiddleware(async (to) => {
  // 跳过初始化页面本身
  if (to.path === '/init') {
    return;
  }

  try {
    // 检查系统是否已初始化
    const systemStatus = await http.get('/system/status');

    // 如果系统未初始化且不在初始化页面，重定向到初始化页面
    if (!systemStatus.initialized) {
      return navigateTo('/init');
    }
  } catch (error) {
    // 如果无法获取系统状态，假设需要初始化
    console.warn('无法获取系统状态，重定向到初始化页面:', error);
    return navigateTo('/init');
  }
});
