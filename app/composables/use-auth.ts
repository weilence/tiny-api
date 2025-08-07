// 用户认证相关的 composable
// 用户状态
const user = ref<Serialized<UserInfo> | null>(null);
const remember = ref<boolean>(false); // 是否记住登录状态
const isLoggedIn = computed(() => !!user.value && !!token.value);
const token = ref<string | null>(null);

export const useAuth = () => {
  // 从 localStorage 初始化用户状态
  const initializeAuth = async () => {
    remember.value = localStorage.getItem('remember_me') === 'true';

    let userToken: string | null = null;
    if (remember.value) {
      userToken = localStorage.getItem('user_token');
    } else {
      userToken = sessionStorage.getItem('user_token');
    }

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
  const login = async (credentials: { credential: string; password: string; remember: boolean }) => {
    // 这里应该调用你的登录 API
    const res = await http.post('/auth/login', credentials);

    const { token: tokenData, ...userData } = res;

    // 保存令牌
    localStorage.setItem('remember_me', credentials.remember ? 'true' : 'false');
    if (credentials.remember) {
      localStorage.setItem('user_token', tokenData);
    } else {
      sessionStorage.setItem('user_token', tokenData);
    }

    token.value = tokenData;
    user.value = userData;
    remember.value = credentials.remember;
    return { success: true, user: userData };
  };

  // 注册函数
  const register = async (userData: { username: string; email: string; password: string }) => {
    await http.post('/auth/register', userData);

    return { success: true, message: '注册成功' };
  };

  // 登出函数
  const logout = async () => {
    clearAuth();

    await http.post('/auth/logout');
    // 重定向到登录页
    navigateTo('/auth/login');
  };

  // 清除认证信息
  const clearAuth = () => {
    user.value = null;

    if (remember.value) {
      localStorage.removeItem('user_token');
    } else {
      sessionStorage.removeItem('user_token');
    }
  };

  // 忘记密码
  const forgotPassword = async (_email: string) => {
    // 这里应该调用你的忘记密码 API
    // const response = await http.POST('/auth/forgot-password', { email })

    // 模拟 API 响应
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true, message: '重置邮件已发送' };
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
  };
};
