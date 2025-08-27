import { useValidatedParams, v } from 'h3-valibot';
import { eq, and } from 'drizzle-orm';
import { projectUsers } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id: projectId, userId } = await useValidatedParams(
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
  const hasPermission = await checkProjectPermission(currentUserId, projectId, 'ADMIN');
  if (!hasPermission) {
    throwPermissionError('您没有权限管理此项目的成员');
  }

  // Only allow deleting local members; inherited members cannot be removed here.
  await db.delete(projectUsers).where(and(eq(projectUsers.projectId, projectId), eq(projectUsers.userId, userId)));
  return { success: true };
});
