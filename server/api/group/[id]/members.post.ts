export default defineEventHandler(async (event) => {
  const groupId = event.context.params!.id as string;
  const body = await readBody<{ userId: string; role: MemberRole }>(event);
  if (!body?.userId || !body?.role) throw createError({ statusCode: 400, message: 'userId and role are required' });

  await prisma.groupUser.upsert({
    where: { groupId_userId: { groupId, userId: body.userId } },
    create: { groupId, userId: body.userId, role: body.role as any },
    update: { role: body.role as any },
  });

  return { success: true };
});
