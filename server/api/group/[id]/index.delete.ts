import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const userId = event.context.auth.user;

  // 检查用户是否有ADMIN权限
  const hasPermission = await checkGroupPermission(userId, id, 'ADMIN');
  if (!hasPermission) {
    throwPermissionError('您没有权限删除此分组');
  }

  const group = await prisma.group.delete({
    where: { id },
  });
  return group;
});
