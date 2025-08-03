// 用户认证相关的 composable
// 用户状态
const user = ref<Serialized<UserInfo> | null>(null);
const token = ref<string | null>(null);
const isLoggedIn = computed(() => !!user.value && !!token.value);

export const useAuth = () => {
  // 从 localStorage 初始化用户状态
  const initializeAuth = async () => {
    if (!import.meta.client) {
      return;
    }

    const userToken = localStorage.getItem('user_token');
    if (!userToken) {
      return;
    }

    token.value = userToken;
    await refreshUser();
  };

  const refreshUser = async () => {
    const res = await http.get('/user');
    user.value = res;
  };

  // 登录函数
  const login = async (credentials: { email: string; password: string }) => {
    try {
      // 这里应该调用你的登录 API
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials,
      });

      const { token: tokenData, ...userData } = res;

      // 保存令牌
      if (import.meta.client) {
        localStorage.setItem('user_token', tokenData);
      }

      token.value = tokenData;
      user.value = userData;
      return { success: true, user: userData };
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  // 注册函数
  const register = async (userData: { username: string; email: string; password: string }) => {
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: userData,
      });

      return { success: true, message: '注册成功' };
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  // 登出函数
  const logout = () => {
    user.value = null;

    if (import.meta.client) {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_data');
    }

    // 重定向到登录页
    navigateTo('/auth/login');
  };

  // 清除认证信息
  const clearAuth = () => {
    user.value = null;

    if (import.meta.client) {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_data');
    }
  };

  // 忘记密码
  const forgotPassword = async (_email: string) => {
    try {
      // 这里应该调用你的忘记密码 API
      // const response = await $fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   body: { email }
      // })

      // 模拟 API 响应
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true, message: '重置邮件已发送' };
    } catch (error) {
      console.error('发送重置邮件失败:', error);
      throw error;
    }
  };

  // 获取认证头
  const getAuthHeaders = () => {
    if (import.meta.client) {
      const token = localStorage.getItem('user_token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
    return {};
  };

  return {
    user: readonly(user),
    token: readonly(token),
    isLoggedIn,
    initializeAuth,
    refreshUser,
    login,
    register,
    logout,
    clearAuth,
    forgotPassword,
    getAuthHeaders,
  };
};
