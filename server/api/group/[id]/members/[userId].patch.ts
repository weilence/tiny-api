export default defineEventHandler(async (event) => {
  const groupId = event.context.params!.id as string;
  const userId = event.context.params!.userId as string;
  const body = await readBody<{ role: MemberRole }>(event);
  if (!body?.role) throw createError({ statusCode: 400, message: 'role is required' });

  await prisma.groupUser.update({
    where: { groupId_userId: { groupId, userId } },
    data: { role: body.role as any },
  });

  return { success: true };
});
