export default defineEventHandler(async (event) => {
  // 检查系统是否已经初始化
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    throw createError({
      statusCode: 400,
      message: '系统已经初始化，无法重复创建管理员账户',
    });
  }

  const req = await readBody<SystemInitReq>(event);

  // 验证请求数据
  if (!req.username || !req.email || !req.password) {
    throw createError({
      statusCode: 400,
      message: '用户名、邮箱和密码不能为空',
    });
  }

  if (req.password.length < 6) {
    throw createError({
      statusCode: 400,
      message: '密码至少需要6位字符',
    });
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.email)) {
    throw createError({
      statusCode: 400,
      message: '请输入有效的邮箱地址',
    });
  }

  try {
    // 加密密码
    const hashedPassword = await hashPassword(req.password);

    // 创建管理员用户
    await prisma.user.create({
      data: {
        username: req.username,
        email: req.email,
        password: hashedPassword,
        name: req.name || req.username,
        role: 'ADMIN', // 默认角色为管理员
      },
    });

    return {
      success: true,
      message: '系统初始化成功，管理员账户已创建',
    } as SystemInitRes;
  } catch (error) {
    console.error('系统初始化失败:', error);
    throw createError({
      statusCode: 500,
      message: '系统初始化失败，请稍后重试',
    });
  }
});
