import { eq } from 'drizzle-orm';
import { useValidatedParams, v } from 'h3-valibot';
import { users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id: targetUserId } = await useValidatedParams(event, v.object({ id: v.string() }));

  if (!targetUserId) {
    throw createError({
      statusCode: 400,
      message: '用户ID不能为空',
    });
  }

  const body = await readBody<AdminUserUpdateReq>(event);

  // 禁止用户修改自己的角色
  const currentUserId = event.context.auth.user;
  if (body.role && currentUserId === targetUserId) {
    throw createError({
      statusCode: 400,
      message: '不能修改自己的角色',
    });
  }

  // 检查目标用户是否存在
  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  });

  if (!targetUser) {
    throw createError({
      statusCode: 404,
      message: '用户不存在',
    });
  }

  // 如果更新邮箱，检查是否已被其他用户使用
  if (body.email && body.email !== targetUser.email) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email),
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
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, body.username),
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

  const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, targetUserId)).returning({
    id: users.id,
    email: users.email,
    username: users.username,
    name: users.name,
    role: users.role,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  });

  return updatedUser;
});
