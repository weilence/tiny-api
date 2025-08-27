import { useValidatedParams, v } from 'h3-valibot';
import { eq } from 'drizzle-orm';
import { groups, groupUsers } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const userId = event.context.auth.user;

  // 检查用户是否有ADMIN权限
  const hasPermission = await checkGroupPermission(userId, id, 'ADMIN');
  if (!hasPermission) {
    throwPermissionError('您没有权限删除此分组');
  }

  const group = await db.transaction(async (tx) => {
    await tx.delete(groupUsers).where(eq(groupUsers.groupId, id));
    const [deletedGroup] = await tx.delete(groups).where(eq(groups.id, id)).returning();
    return deletedGroup;
  });
  return group;
});
