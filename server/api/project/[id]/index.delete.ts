import { useValidatedParams, v } from 'h3-valibot';
import { eq, inArray } from 'drizzle-orm';
import { projects, projectUsers, endpointGroups, endpoints } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const userId = event.context.auth.user;

  // 检查用户是否有Project的ADMIN权限
  const hasPermission = await checkProjectPermission(userId, id, 'ADMIN');
  if (!hasPermission) {
    throwPermissionError('您没有权限删除此项目');
  }

  await db.transaction(async (tx) => {
    const groups = await tx.query.endpointGroups.findMany({
      where: eq(endpointGroups.projectId, id),
      columns: { id: true },
    });
    const groupIds = groups.map((group) => group.id);

    if (groupIds.length > 0) {
      await tx.delete(endpoints).where(inArray(endpoints.groupId, groupIds));
    }
    await tx.delete(endpointGroups).where(eq(endpointGroups.projectId, id));
    await tx.delete(projectUsers).where(eq(projectUsers.projectId, id));
    await tx.delete(projects).where(eq(projects.id, id));
  });
});
