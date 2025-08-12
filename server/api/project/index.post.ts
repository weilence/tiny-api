export default defineEventHandler(async (event) => {
  const body = await readBody<ProjectCreateReq>(event);
  const userId = event.context.auth.user;

  // 检查用户是否有Group的DEVELOPER以上权限
  const hasPermission = await checkGroupPermission(userId, body.groupId, 'DEVELOPER');
  if (!hasPermission) {
    throwPermissionError('您没有权限在此分组中创建项目');
  }

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
