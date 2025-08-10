import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id: groupId } = await useValidatedParams(
    event,
    v.object({
      id: v.string(),
    })
  );
  const body = await readBody<{ userId: string; role: MemberRole }>(event);
  if (!body?.userId || !body?.role) throw createError({ statusCode: 400, message: 'userId and role are required' });

  await prisma.groupUser.upsert({
    where: { groupId_userId: { groupId, userId: body.userId } },
    create: { groupId, userId: body.userId, role: body.role as any },
    update: { role: body.role as any },
  });

  return { success: true };
});
