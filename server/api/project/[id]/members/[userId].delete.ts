import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id: projectId, userId } = await useValidatedParams(
    event,
    v.object({
      id: v.string(),
      userId: v.string(),
    })
  );

  // Only allow deleting local members; inherited members cannot be removed here.
  await prisma.projectUser.delete({ where: { projectId_userId: { projectId, userId } } });
  return { success: true };
});
