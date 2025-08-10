export default defineEventHandler(async (event) => {
  const userId = event.context.auth.user;
  const req = await readBody<UserUpdatePasswordReq>(event);
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw createError({
      statusCode: 400,
      message: '用户不存在',
    });
  }

  if (!(await verifyPassword(user.password, req.oldPassword))) {
    throw createError({
      statusCode: 400,
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

  return {
    success: true,
    message: '密码修改成功',
  };
});
