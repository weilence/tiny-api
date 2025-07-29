import prisma from '~~/lib/prisma';

export default defineEventHandler(async (event) => {
  const groupId = getQuery(event).groupId as string;
  if (!groupId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Group ID is required',
    });
  }

  const projects: ProjectQueryRes[] = await prisma.project.findMany({
    where: { groupId: groupId },
    select: {
      id: true,
      name: true,
      description: true,
      groupId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return projects;
});
