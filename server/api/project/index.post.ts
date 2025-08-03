export default defineEventHandler(async (event) => {
  const body = await readBody<ProjectCreateReq>(event);

  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description,
      icon: body.icon,
      groupId: body.groupId,
    },
  });

  return project;
});
