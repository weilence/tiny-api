import prisma from '~~/lib/prisma';

export default defineEventHandler(async (_event) => {
  const groups: GroupQueryRes[] = await prisma.group.findMany({
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
