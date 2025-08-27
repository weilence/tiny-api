import { groups, groupUsers } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody<GroupCreateReq>(event);
  const userId = event.context.auth.user;

  const group = await db.transaction(async (tx) => {
    const [g] = await tx.insert(groups).values(body).returning();
    await tx.insert(groupUsers).values({
      groupId: g.id,
      userId,
      role: 'ADMIN',
    });
    return g;
  });

  return group;
});
