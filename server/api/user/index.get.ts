export default defineEventHandler(async (event) => {
  const userId = event.context.auth?.user;
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

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as UserInfo;
});
