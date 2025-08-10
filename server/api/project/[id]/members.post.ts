import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id: projectId } = await useValidatedParams(
    event,
    v.object({
      id: v.string(),
      userId: v.string(),
    })
  );

  const body = await readBody<{ userId: string; role: MemberRole }>(event);
  if (!body?.userId || !body?.role) throw createError({ statusCode: 400, message: 'userId and role are required' });

  await prisma.projectUser.upsert({
    where: { projectId_userId: { projectId, userId: body.userId } },
    create: { projectId, userId: body.userId, role: body.role as any },
    update: { role: body.role as any },
  });

  return { success: true };
});
