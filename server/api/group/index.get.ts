export default defineEventHandler(async (event) => {
  const userId = event.context.auth.user;

  // 先获取用户所属的group IDs
  const userGroups = await prisma.groupUser.findMany({
    where: {
      userId,
    },
    select: {
      groupId: true,
    },
  });

  const groupIds = userGroups.map((ug) => ug.groupId);

  const groups: GroupQueryRes[] = await prisma.group.findMany({
    where: {
      id: {
        in: groupIds,
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return groups;
});
