export default defineEventHandler(async (event) => {
  const projectId = event.context.params!.id as string;
  const userId = event.context.params!.userId as string;

  // Only allow deleting local members; inherited members cannot be removed here.
  await prisma.projectUser.delete({ where: { projectId_userId: { projectId, userId } } });
  return { success: true };
});
