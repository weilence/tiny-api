export default defineEventHandler(async (event) => {
  const groupId = event.context.params!.id as string;
  const userId = event.context.params!.userId as string;

  await prisma.groupUser.delete({ where: { groupId_userId: { groupId, userId } } });
  return { success: true };
});
