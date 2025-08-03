export default defineEventHandler(async (_event) => {
  // 检查系统是否已初始化（通过检查用户数量）
  const userCount = await prisma.user.count();

  return {
    initialized: userCount > 0,
    userCount,
  } as SystemStatusRes;
});
