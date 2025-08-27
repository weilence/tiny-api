import { eq, inArray } from 'drizzle-orm';
import { groupUsers, groups } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.user;

  // 先获取用户所属的group IDs
  const userGroups = await db.query.groupUsers.findMany({
    where: eq(groupUsers.userId, userId),
    columns: {
      groupId: true,
    },
  });

  const groupIds = userGroups.map((ug) => ug.groupId);

  const groupsResult: GroupQueryRes[] = await db.query.groups.findMany({
    where: inArray(groups.id, groupIds),
    columns: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return groupsResult;
});
