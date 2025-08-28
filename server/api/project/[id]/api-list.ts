import { asc, eq } from 'drizzle-orm';
import { endpointGroups, endpoints } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const { groupId } = await useValidatedQuery(event, v.object({ groupId: v.optional(v.string()) }));
  const userId = event.context.auth.user;

  // 检查用户是否有Project的访问权限（GUEST以上）
  const hasPermission = await checkProjectPermission(userId, id, 'GUEST');
  if (!hasPermission) {
    throwPermissionError('您没有权限访问此项目');
  }

  const res = (await db
    .select({
      id: endpoints.id,
      name: endpoints.name,
      description: endpoints.description,
      method: endpoints.method,
      path: endpoints.path,
      groupId: endpoints.groupId,
      tags: endpoints.tags,
    })
    .from(endpoints)
    .innerJoin(endpointGroups, eq(endpoints.groupId, endpointGroups.id))
    .where(groupId ? eq(endpoints.groupId, groupId) : eq(endpointGroups.projectId, id))
    .orderBy(asc(endpoints.name))) satisfies ProjectApiListGetRes[];

  return res;
});
