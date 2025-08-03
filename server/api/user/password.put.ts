export default defineEventHandler(async (event) => {
  const req = await readBody<UserUpdatePasswordReq>(event);

  const userId = getRouterParam(event, 'id');
  if (!userId) {
    throw createError({
      statusCode: 400,
      message: '用户ID不能为空',
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
