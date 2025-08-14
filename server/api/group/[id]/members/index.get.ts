import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id: groupId } = await useValidatedParams(
    event,
    v.object({
      id: v.string(),
    })
  );
  const members = await prisma.groupUser.findMany({ where: { groupId } });

  const users = await prisma.user.findMany({
    where: { id: { in: members.map((m) => m.userId) } },
    select: { id: true, username: true, name: true, email: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  const list = members.map((m) => ({
    user: userMap.get(m.userId)!,
    role: m.role as unknown as MemberRole,
  }));

  const currentUserId = event.context.auth.user;
  const selfRole = members.find((m) => m.userId === currentUserId)?.role || 'GUEST';

  return { members: list, selfRole: selfRole as any } as GroupMembersGetRes;
});
