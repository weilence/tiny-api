import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      // 从环境变量读取 Redis 配置
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    redisClient.on('disconnect', () => {
      console.log('Redis Client Disconnected');
    });

    await redisClient.connect();
  }

  return redisClient;
};

export const closeRedisClient = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

// 认证相关的 Redis 操作
export const redis = {
  // 设置用户会话
  async setUserSession(token: string, userId: string, expirationSeconds = 86400) {
    const client = await getRedisClient();
    await client.setEx(`session:${token}`, expirationSeconds, userId);
  },

  // 获取用户会话
  async getUserSession(token: string): Promise<string | null> {
    const client = await getRedisClient();
    return await client.get(`session:${token}`);
  },

  // 删除用户会话
  async deleteUserSession(token: string) {
    const client = await getRedisClient();
    await client.del(`session:${token}`);
  },

  // 检查会话是否存在
  async sessionExists(token: string): Promise<boolean> {
    const client = await getRedisClient();
    const exists = await client.exists(`session:${token}`);
    return exists === 1;
  },

  // 延长会话时间
  async extendSession(token: string, expirationSeconds = 86400) {
    const client = await getRedisClient();
    await client.expire(`session:${token}`, expirationSeconds);
  },
};
