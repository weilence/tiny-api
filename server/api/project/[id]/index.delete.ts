import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const userId = event.context.auth.user;

  // 检查用户是否有Project的ADMIN权限
  const hasPermission = await checkProjectPermission(userId, id, 'ADMIN');
  if (!hasPermission) {
    throwPermissionError('您没有权限删除此项目');
  }

  await prisma.$transaction(async (tx) => {
    const groups = await tx.endpointGroup.findMany({
      where: { projectId: id },
      select: { id: true },
    });
    const groupIds = groups.map((group) => group.id);

    await tx.endpoint.deleteMany({ where: { groupId: { in: groupIds } } });
    await tx.endpointGroup.deleteMany({ where: { projectId: id } });
    await tx.projectUser.deleteMany({ where: { projectId: id } });
    await tx.project.delete({ where: { id } });
  });
});
