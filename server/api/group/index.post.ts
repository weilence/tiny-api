export default defineEventHandler(async (event) => {
  const body = await readBody<GroupCreateReq>(event);
  const userId = event.context.auth?.user as string;

  const group = await prisma.$transaction(async (tx) => {
    const g = await tx.group.create({ data: body });
    await tx.groupUser.create({
      data: {
        groupId: g.id,
        userId,
        role: 'ADMIN' as any,
      },
    });
    return g;
  });

  return group;
});
