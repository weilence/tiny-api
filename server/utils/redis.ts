// 认证相关的 Redis 操作
export const redis = {
  // 设置用户会话
  async setUserSession(token: string, userId: string, ttl = 3600) {
    const storage = useStorage('redis');
    await storage.setItem(`session:${token}`, userId, {
      ttl: ttl,
    });
  },

  // 获取用户会话
  async getUserSession(token: string): Promise<string | null> {
    const storage = useStorage('redis');
    return await storage.getItem<string>(`session:${token}`);
  },

  // 删除用户会话
  async deleteUserSession(token: string) {
    const storage = useStorage('redis');
    await storage.removeItem(`session:${token}`);
  },
};
