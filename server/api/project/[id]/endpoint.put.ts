import { and, eq } from 'drizzle-orm';
import { endpoints } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const { endpointId } = await useValidatedQuery(event, v.object({ endpointId: v.string() }));
  const userId = event.context.auth.user;

  // 需要 DEVELOPER 权限修改接口
  const hasPermission = await checkProjectPermission(userId, id, 'DEVELOPER');
  if (!hasPermission) {
    throwPermissionError('您没有权限修改此项目的接口');
  }

  const body = await readBody(event);

  // 仅允许白名单字段更新
  const update: Partial<typeof endpoints.$inferInsert> = {};
  if (body.name !== undefined) update.name = body.name as any;
  if (body.description !== undefined) update.description = body.description as any;
  if (body.method !== undefined) update.method = body.method as any;
  if (body.path !== undefined) update.path = body.path as any;
  if (body.tags !== undefined) update.tags = body.tags as any;
  if (body.headers !== undefined) update.headers = body.headers as any;
  if (body.queryParams !== undefined) update.queryParams = body.queryParams as any;
  if (body.body !== undefined) update.body = body.body as any;
  if (body.response !== undefined) update.response = body.response as any;

  const [updated] = await db
    .update(endpoints)
    .set(update)
    .where(and(eq(endpoints.id, endpointId)))
    .returning();

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: '接口未找到或更新失败' });
  }

  return updated;
});
