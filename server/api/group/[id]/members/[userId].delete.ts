import { useValidatedParams, v } from 'h3-valibot';
import { eq, and } from 'drizzle-orm';
import { groupUsers } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id: groupId, userId } = await useValidatedParams(
    event,
    v.object({
      id: v.string(),
      userId: v.string(),
    })
  );

  const currentUserId = event.context.auth.user;

  // 禁止删除自己
  if (currentUserId === userId) {
    throw createError({
      statusCode: 400,
      message: '不能删除自己',
    });
  }

  // 检查当前用户是否有权限管理成员（需要ADMIN权限）
  const hasPermission = await checkGroupPermission(currentUserId, groupId, 'ADMIN');
  if (!hasPermission) {
    throwPermissionError('您没有权限管理此分组的成员');
  }

  await db.delete(groupUsers).where(and(eq(groupUsers.groupId, groupId), eq(groupUsers.userId, userId)));
  return { success: true };
});
