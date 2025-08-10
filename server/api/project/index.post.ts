export default defineEventHandler(async (event) => {
  const body = await readBody<ProjectCreateReq>(event);
  const userId = event.context.auth?.user as string;

  const project = await prisma.$transaction(async (tx) => {
    const p = await tx.project.create({
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        groupId: body.groupId,
      },
    });
    await tx.projectUser.create({
      data: {
        projectId: p.id,
        userId,
        role: 'ADMIN' as any,
      },
    });
    return p;
  });

  return project;
});
