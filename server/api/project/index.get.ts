import { eq } from 'drizzle-orm';
import { projects } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const groupId = getQuery(event).groupId as string;
  const userId = event.context.auth.user;

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: 'Group ID is required',
    });
  }

  // 检查用户是否是该Group的成员
  const isMember = await checkGroupMember(userId, groupId);
  if (!isMember) {
    throwPermissionError('您没有权限查看此分组下的项目');
  }

  const projectsResult: ProjectQueryRes[] = await db.query.projects.findMany({
    where: eq(projects.groupId, groupId),
    columns: {
      id: true,
      name: true,
      description: true,
      icon: true,
      groupId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return projectsResult;
});
