import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id: groupId, userId } = await useValidatedParams(
    event,
    v.object({
      id: v.string(),
      userId: v.string(),
    })
  );

  await prisma.groupUser.delete({ where: { groupId_userId: { groupId, userId } } });
  return { success: true };
});
