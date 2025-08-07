import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  const req = await readBody<UserLoginReq>(event);

  // 检查credential是否是邮箱格式
  const isEmail = req.credential.includes('@');

  const user = await prisma.user.findUnique({
    where: isEmail ? { email: req.credential } : { username: req.credential },
  });

  if (!user) {
    throw createError({
      statusCode: 400,
      message: '用户不存在',
    });
  }

  if (!(await verifyPassword(user.password, req.password))) {
    throw createError({
      statusCode: 400,
      message: '密码错误',
    });
  }

  // 更新最后登录时间
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = uuidv4().replace(/-/g, '').toLowerCase();
  await redis.setUserSession(token, user.id, 3600);

  return {
    id: updatedUser.id,
    token: token,
    email: updatedUser.email,
    username: updatedUser.username,
    name: updatedUser.name,
    role: updatedUser.role,
    lastLoginAt: updatedUser.lastLoginAt,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  } as UserLoginRes;
});
