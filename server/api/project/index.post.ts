import { projects, projectUsers } from '~~/server/db/schema';
import type { ProjectCreateReq } from '~~/shared/types/project';

export default defineEventHandler(async (event) => {
  const body = await readBody<ProjectCreateReq>(event);
  const userId = event.context.auth.user;

  // 检查用户是否有Group的DEVELOPER以上权限
  const hasPermission = await checkGroupPermission(userId, body.groupId, 'DEVELOPER');
  if (!hasPermission) {
    throwPermissionError('您没有权限在此分组中创建项目');
  }

  const project = await db.transaction(async (tx) => {
    const [p] = await tx
      .insert(projects)
      .values({
        name: body.name,
        description: body.description,
        icon: body.icon,
        groupId: body.groupId,
      })
      .returning();
    await tx.insert(projectUsers).values({
      projectId: p.id,
      userId,
      role: 'ADMIN',
    });
    return p;
  });

  return project;
});
