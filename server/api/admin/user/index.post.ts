export default defineEventHandler(async (event) => {
  const body = await readBody<AdminUserCreateReq>(event);

  // 检查邮箱是否已存在
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUserByEmail) {
    throw createError({
      statusCode: 400,
      message: '邮箱已被使用',
    });
  }

  // 检查用户名是否已存在
  const existingUserByUsername = await prisma.user.findUnique({
    where: { username: body.username },
  });

  if (existingUserByUsername) {
    throw createError({
      statusCode: 400,
      message: '用户名已被使用',
    });
  }

  // 创建新用户
  const hashedPassword = await hashPassword(body.password);

  const newUser = await prisma.user.create({
    data: {
      email: body.email,
      username: body.username,
      password: hashedPassword,
      name: body.name,
      role: body.role,
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
});
