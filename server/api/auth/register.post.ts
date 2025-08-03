export default defineEventHandler(async (event) => {
  const req = await readBody<UserRegisterReq>(event);

  const count = await prisma.user.count({
    where: {
      email: req.email,
    },
  });
  if (count > 0) {
    throw createError({
      statusCode: 400,
      message: '邮箱已被注册',
    });
  }

  const hashedPassword = await hashPassword(req.password);

  await prisma.user.create({
    data: {
      email: req.email,
      username: req.username,
      password: hashedPassword,
    },
  });
});
