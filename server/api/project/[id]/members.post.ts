export default defineEventHandler(async (event) => {
  const projectId = event.context.params!.id as string;
  const body = await readBody<{ userId: string; role: MemberRole }>(event);
  if (!body?.userId || !body?.role) throw createError({ statusCode: 400, message: 'userId and role are required' });

  await prisma.projectUser.upsert({
    where: { projectId_userId: { projectId, userId: body.userId } },
    create: { projectId, userId: body.userId, role: body.role as any },
    update: { role: body.role as any },
  });

  return { success: true };
});
