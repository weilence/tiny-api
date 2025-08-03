// 需要排除的路径（不需要认证的接口）
const excludedPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/system/status',
  '/api/system/init',
];

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const path = url.pathname;

  // 只处理 API 请求
  if (!path.startsWith('/api/') || excludedPaths.includes(path)) {
    return;
  }

  // 获取 Authorization header
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Token ')) {
    throw createError({
      statusCode: 401,
      message: '未提供认证令牌',
    });
  }

  const token = authHeader.substring('Token '.length);
  if (!token) {
    throw createError({
      statusCode: 401,
      message: '无效的认证令牌',
    });
  }

  const user = await redis.getUserSession(token);
  if (!user) {
    throw createError({
      statusCode: 401,
      message: '会话已过期或无效',
    });
  }

  event.context.auth = { user: user };
});
