export default defineEventHandler(async (event) => {
  const req = await readBody<UserUpdateReq>(event);

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

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      username: req.username,
      email: req.email,
      name: req.name,
    },
  });
});
