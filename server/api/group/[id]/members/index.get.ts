import { useValidatedParams, v } from 'h3-valibot';
import { eq, inArray } from 'drizzle-orm';
import { groupUsers, users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id: groupId } = await useValidatedParams(
    event,
    v.object({
      id: v.string(),
    })
  );
  const members = await db.query.groupUsers.findMany({
    where: eq(groupUsers.groupId, groupId),
  });

  const userList = await db.query.users.findMany({
    where: inArray(
      users.id,
      members.map((m) => m.userId)
    ),
    columns: {
      id: true,
      username: true,
      name: true,
      email: true,
    },
  });

  const userMap = new Map(userList.map((u) => [u.id, u]));

  const list = members.map((m) => ({
    user: userMap.get(m.userId)!,
    role: m.role as unknown as MemberRole,
  }));

  const currentUserId = event.context.auth.user;
  const selfRole = members.find((m) => m.userId === currentUserId)?.role || 'GUEST';

  return { members: list, selfRole: selfRole as any } as GroupMembersGetRes;
});
