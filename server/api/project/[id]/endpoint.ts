import { and, eq } from 'drizzle-orm';
import { endpoints } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const { endpointId } = await useValidatedQuery(event, v.object({ endpointId: v.string() }));
  const userId = event.context.auth.user;

  // 检查用户是否有Project的访问权限（GUEST以上）
  const hasPermission = await checkProjectPermission(userId, id, 'GUEST');
  if (!hasPermission) {
    throwPermissionError('您没有权限访问此项目');
  }

  const endpoint = await db.query.endpoints.findFirst({
    where: and(eq(endpoints.id, endpointId)),
  });
  if (!endpoint) {
    throw createError({ statusCode: 404, statusMessage: '接口未找到' });
  }

  return endpoint;
});
