export const useAuth = () => {
  const overlay = useOverlay();

  const rememberMe = useState<boolean>('remember_me', () => localStorage.getItem('remember_me') === 'true');
  const token = useState<string | null>('token', () =>
    rememberMe.value ? localStorage.getItem('user_token') : sessionStorage.getItem('user_token')
  );

  // 登录函数
  const login = async (credentials: {
    credential: string;
    password: string;
    remember: boolean;
    provider?: 'local' | 'ldap';
  }) => {
    // 这里应该调用你的登录 API
    const res = await http.post('/auth/login', credentials);

    const { token: tokenData } = res;

    // 保存令牌
    localStorage.setItem('remember_me', credentials.remember ? 'true' : 'false');
    if (credentials.remember) {
      localStorage.setItem('user_token', tokenData);
    } else {
      sessionStorage.setItem('user_token', tokenData);
    }

    rememberMe.value = credentials.remember;
    token.value = tokenData;
    return { success: true };
  };

  // 注册函数
  const register = async (userData: { username: string; email: string; password: string }) => {
    await http.post('/auth/register', userData);

    return { success: true, message: '注册成功' };
  };

  // 登出函数
  const logout = async () => {
    clearAuth();
    overlay.closeAll();
    await navigateTo('/auth/login');
  };

  // 清除认证信息
  const clearAuth = () => {
    token.value = null;
    if (rememberMe.value) {
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
    token: readonly(token),
    rememberMe: readonly(rememberMe),
    login,
    register,
    logout,
    clearAuth,
    forgotPassword,
  };
};
