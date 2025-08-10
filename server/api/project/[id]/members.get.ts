export default defineEventHandler(async (event) => {
  const projectId = event.context.params!.id as string;
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { groupId: true } });
  if (!project) throw createError({ statusCode: 404, message: 'Project not found' });

  const localMembers = await prisma.projectUser.findMany({ where: { projectId } });
  const groupMembers = await prisma.groupUser.findMany({ where: { groupId: project.groupId } });

  const userIds = Array.from(new Set([...localMembers.map((m) => m.userId), ...groupMembers.map((m) => m.userId)]));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, name: true, email: true },
  });
  const umap = new Map(users.map((u) => [u.id, u]));

  const currentUserId = event.context.auth?.user as string | undefined;
  const gRole = groupMembers.find((m) => m.userId === currentUserId)?.role || 'GUEST';
  const pRole = localMembers.find((m) => m.userId === currentUserId)?.role || 'GUEST';
  const order: MemberRole[] = ['GUEST', 'DEVELOPER', 'ADMIN'];
  const selfRole = order[Math.max(order.indexOf(gRole as any), order.indexOf(pRole as any))] as MemberRole;

  return {
    inherited: groupMembers.map((m) => ({ user: umap.get(m.userId)!, role: m.role as any })),
    local: localMembers.map((m) => ({ user: umap.get(m.userId)!, role: m.role as any })),
    selfRole,
  } as ProjectMembersGetRes;
});
