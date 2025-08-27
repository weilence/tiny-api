import { eq } from 'drizzle-orm';
import { useValidatedParams, v } from 'h3-valibot';
import { groupUsers, projectUsers, users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const currentUserId = event.context.auth.user;
  const { id: targetUserId } = await useValidatedParams(event, v.object({ id: v.string() }));

  if (!targetUserId) {
    throw createError({
      statusCode: 400,
      message: '用户ID不能为空',
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

  // 不能删除自己
  if (targetUserId === currentUserId) {
    throw createError({
      statusCode: 400,
      message: '不能删除自己的账户',
    });
  }

  // 使用事务同时删除成员关系与用户
  await db.transaction(async (tx) => {
    await tx.delete(groupUsers).where(eq(groupUsers.userId, targetUserId));
    await tx.delete(projectUsers).where(eq(projectUsers.userId, targetUserId));
    await tx.delete(users).where(eq(users.id, targetUserId));
  });

  return {
    success: true,
    message: '用户删除成功',
  };
});
