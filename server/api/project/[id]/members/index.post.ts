import { useValidatedParams, v } from 'h3-valibot';
import { projectUsers } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id: projectId } = await useValidatedParams(
    event,
    v.object({
      id: v.string(),
    })
  );

  const currentUserId = event.context.auth.user;

  // 检查当前用户是否有权限管理成员（需要ADMIN权限）
  const hasPermission = await checkProjectPermission(currentUserId, projectId, 'ADMIN');
  if (!hasPermission) {
    throwPermissionError('您没有权限管理此项目的成员');
  }

  const body = await readBody<{ userId: string; role: MemberRole }>(event);
  if (!body?.userId || !body?.role) throw createError({ statusCode: 400, message: 'userId and role are required' });

  await db
    .insert(projectUsers)
    .values({
      projectId,
      userId: body.userId,
      role: body.role as any,
    })
    .onConflictDoUpdate({
      target: [projectUsers.projectId, projectUsers.userId],
      set: { role: body.role as any },
    });

  return { success: true };
});
