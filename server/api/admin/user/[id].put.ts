import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id: targetUserId } = await useValidatedParams(event, v.object({ id: v.string() }));

  if (!targetUserId) {
    throw createError({
      statusCode: 400,
      message: '用户ID不能为空',
    });
  }

  const body = await readBody<AdminUserUpdateReq>(event);

  // 检查目标用户是否存在
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw createError({
      statusCode: 404,
      message: '用户不存在',
    });
  }

  // 如果更新邮箱，检查是否已被其他用户使用
  if (body.email && body.email !== targetUser.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: '邮箱已被其他用户使用',
      });
    }
  }

  // 如果更新用户名，检查是否已被其他用户使用
  if (body.username && body.username !== targetUser.username) {
    const existingUser = await prisma.user.findUnique({
      where: { username: body.username },
    });

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: '用户名已被其他用户使用',
      });
    }
  }

  const updateData: any = {};

  if (body.email) updateData.email = body.email;
  if (body.username) updateData.username = body.username;
  if (body.name !== undefined) updateData.name = body.name;
  if (body.role) updateData.role = body.role;

  // 如果要更新密码
  if (body.password) {
    updateData.password = await hashPassword(body.password);
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: updateData,
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

  return updatedUser;
});
