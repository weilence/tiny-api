import type { FetchResult } from '#app';
import { StorageSerializers, useLocalStorage } from '@vueuse/core';

export const useAuth = () => {
  const overlay = useOverlay();
  const rememberMe = useLocalStorage<boolean>('remember_me', false);
  const token = useLocalStorage<string | null>('user_token', null);
  const user = useLocalStorage<FetchResult<'/api/user', 'get'>>('user_data', null, {
    serializer: StorageSerializers.object,
  });

  // 登录函数
  const login = async (credentials: {
    credential: string;
    password: string;
    remember: boolean;
    provider?: 'local' | 'ldap';
  }) => {
    // 保存令牌
    rememberMe.value = credentials.remember;

    const { token: tokenData, ...userData } = await http.post('/api/auth/login', credentials);

    token.value = tokenData;
    user.value = userData;
    return { success: true };
  };

  const refreshUser = async () => {
    const res = await http.get('/api/user');
    user.value = res;
  };

  // 注册函数
  const register = async (userData: { username: string; email: string; password: string }) => {
    await http.post('/api/auth/register', userData);
    return { success: true, message: '注册成功' };
  };

  // 登出函数
  const logout = async () => {
    token.value = null;
    user.value = null;
    overlay.closeAll();
    await navigateTo('/auth/login');
  };

  // 忘记密码
  const forgotPassword = async (_email: string) => {
    // 这里应该调用你的忘记密码 API
    // const response = await http.POST('/api/auth/forgot-password', { email })

    // 模拟 API 响应
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true, message: '重置邮件已发送' };
  };

  return {
    token: readonly(token),
    rememberMe: readonly(rememberMe),
    user: readonly(user),
    refreshUser,
    login,
    register,
    logout,
    forgotPassword,
  };
};
