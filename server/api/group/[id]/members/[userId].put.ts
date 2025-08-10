import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id: groupId, userId } = await useValidatedParams(
    event,
    v.object({
      id: v.string(),
      userId: v.string(),
    })
  );

  const body = await readBody<{ role: MemberRole }>(event);
  if (!body?.role) throw createError({ statusCode: 400, message: 'role is required' });

  await prisma.groupUser.update({
    where: { groupId_userId: { groupId, userId } },
    data: { role: body.role as any },
  });

  return { success: true };
});
