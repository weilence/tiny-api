export default defineEventHandler(async (event) => {
  const projectId = event.context.params!.id as string;
  const userId = event.context.params!.userId as string;
  const body = await readBody<{ role: MemberRole }>(event);
  if (!body?.role) throw createError({ statusCode: 400, message: 'role is required' });

  await prisma.projectUser.update({
    where: { projectId_userId: { projectId, userId } },
    data: { role: body.role as any },
  });

  return { success: true };
});
