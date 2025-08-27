import { useValidatedParams, v } from 'h3-valibot';
import { eq } from 'drizzle-orm';
import { groups } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const userId = event.context.auth.user;

  // 检查用户是否有DEVELOPER以上权限
  const hasPermission = await checkGroupPermission(userId, id, 'DEVELOPER');
  if (!hasPermission) {
    throwPermissionError('您没有权限修改此分组');
  }

  const body = await readBody<GroupUpdateReq>(event);
  const [group] = await db.update(groups).set(body).where(eq(groups.id, id)).returning();
  return group;
});
