import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const currentUserId = event.context.auth.user;
  const { id: targetUserId } = await useValidatedParams(event, v.object({ id: v.string() }));

  if (!targetUserId) {
    throw createError({
      statusCode: 400,
      message: '用户ID不能为空',
    });
  }

  // 检查目标用户是否存在
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw createError({
      statusCode: 404,
      message: '用户不存在',
    });
  }

  // 不能删除自己
  if (targetUserId === currentUserId) {
    throw createError({
      statusCode: 400,
      message: '不能删除自己的账户',
    });
  }

  await prisma.user.delete({
    where: { id: targetUserId },
  });

  return {
    success: true,
    message: '用户删除成功',
  };
});
