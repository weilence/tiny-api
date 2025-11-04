import { and, eq } from 'drizzle-orm';
import { endpoints } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const userId = event.context.auth.user;

  // 需要 DEVELOPER 权限修改接口
  const hasPermission = await checkProjectPermission(userId, id, 'DEVELOPER');
  if (!hasPermission) {
    throwPermissionError('您没有权限修改此项目的接口');
  }

  const body = await readBody(event);
  await db
    .update(endpoints)
    .set(body)
    .where(and(eq(endpoints.id, body.id)));
});
