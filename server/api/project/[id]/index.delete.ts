export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID is required' });
  }

  await prisma.$transaction(async (tx) => {
    const groups = await tx.endpointGroup.findMany({
      where: { projectId: id },
      select: { id: true },
    });
    const groupIds = groups.map((group) => group.id);

    await tx.endpoint.deleteMany({ where: { groupId: { in: groupIds } } });
    await tx.endpointGroup.deleteMany({ where: { projectId: id } });
    await tx.project.delete({ where: { id } });
  });
});
