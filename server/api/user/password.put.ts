export default defineEventHandler(async (event) => {
  const userId = event.context.auth?.user;
  const req = await readBody<UserUpdatePasswordReq>(event);

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: '请先登录',
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw createError({
      statusCode: 404,
      message: '用户不存在',
    });
  }

  if (!(await verifyPassword(user.password, req.oldPassword))) {
    throw createError({
      statusCode: 401,
      message: '旧密码错误',
    });
  }

  const newPasswordHash = await hashPassword(req.newPassword);
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: newPasswordHash,
    },
  });
});
