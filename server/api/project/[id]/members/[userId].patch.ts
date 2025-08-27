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

  // 禁止调整自己的角色
  if (currentUserId === userId) {
    throw createError({
      statusCode: 400,
      message: '不能调整自己的角色',
    });
  }

  // 检查当前用户是否有权限管理成员（需要ADMIN权限）
  const hasPermission = await checkProjectPermission(currentUserId, projectId, 'ADMIN');
  if (!hasPermission) {
    throwPermissionError('您没有权限管理此项目的成员');
  }

  const body = await readBody<{ role: MemberRole }>(event);
  if (!body?.role) throw createError({ statusCode: 400, message: 'role is required' });

  await db
    .update(projectUsers)
    .set({
      role: body.role as any,
    })
    .where(and(eq(projectUsers.projectId, projectId), eq(projectUsers.userId, userId)));

  return { success: true };
});
