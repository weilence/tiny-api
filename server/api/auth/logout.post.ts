export default defineEventHandler(async (event) => {
  const token = event.context.auth.token;
  try {
    // 删除 Redis 中的会话
    await redis.deleteUserSession(token);

    return {
      success: true,
      message: '退出登录成功',
    };
  } catch (error) {
    console.error('登出失败:', error);
    throw createError({
      statusCode: 500,
      message: '登出失败，请稍后重试',
    });
  }
});
