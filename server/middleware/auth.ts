// 需要排除的路径（不需要认证的接口）
const excludedPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/system/status',
  '/api/system/init',
];

// 需要管理员权限的路径模式（使用简单的字符串匹配）
const adminPathPrefix = '/api/admin/';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const path = url.pathname;

  // 只处理 API 请求
  if (!path.startsWith('/api/') || excludedPaths.includes(path)) {
    event.context.auth = { user: '', token: '' };
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

  const userId = await redis.getUserSession(token);
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: '会话已过期或无效',
    });
  }

  // 获取完整的用户信息
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      message: '用户不存在',
    });
  }

  // 检查是否需要管理员权限
  const isAdminPath = path.startsWith(adminPathPrefix);

  if (isAdminPath && user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: '权限不足，需要管理员权限',
    });
  }

  event.context.auth = { user: user.id, token: token };
});
