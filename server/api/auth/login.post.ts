import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  const req = await readBody<UserLoginReq>(event);

  const user = await prisma.user.findUnique({
    where: {
      email: req.email,
    },
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

  const token = uuidv4().replace(/-/g, '').toLowerCase();
  await redis.setUserSession(token, user.id, 3600);

  return {
    id: user.id,
    token: token,
    email: user.email,
    username: user.username,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as UserLoginRes;
});
