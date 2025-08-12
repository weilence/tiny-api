import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const userId = event.context.auth.user;

  // 检查用户是否有Project的DEVELOPER以上权限
  const hasPermission = await checkProjectPermission(userId, id, 'DEVELOPER');
  if (!hasPermission) {
    throwPermissionError('您没有权限修改此项目');
  }

  const body = await readBody<ProjectUpdateReq>(event);
  const project = await prisma.project.update({
    where: { id },
    data: body,
  });
  return project;
});
