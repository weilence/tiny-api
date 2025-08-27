import { useValidatedParams, v } from 'h3-valibot';
import { eq, inArray } from 'drizzle-orm';
import { projects, projectUsers, groupUsers, users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id: projectId } = await useValidatedParams(
    event,
    v.object({
      id: v.string(),
    })
  );

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: { groupId: true },
  });
  if (!project) throw createError({ statusCode: 404, message: 'Project not found' });

  const localMembers = await db.query.projectUsers.findMany({
    where: eq(projectUsers.projectId, projectId),
  });
  const groupMembers = await db.query.groupUsers.findMany({
    where: eq(groupUsers.groupId, project.groupId),
  });

  const userIds = Array.from(new Set([...localMembers.map((m) => m.userId), ...groupMembers.map((m) => m.userId)]));
  const userList = await db.query.users.findMany({
    where: inArray(users.id, userIds),
    columns: {
      id: true,
      username: true,
      name: true,
      email: true,
    },
  });
  const umap = new Map(userList.map((u) => [u.id, u]));

  const currentUserId = event.context.auth.user;
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
