import { eq, and } from 'drizzle-orm';
import { groupUsers, projectUsers, projects } from '~~/server/db/schema';

export type MemberRole = 'GUEST' | 'DEVELOPER' | 'ADMIN';

// 角色权重，用于比较权限级别
const ROLE_WEIGHTS: Record<MemberRole, number> = {
  GUEST: 1,
  DEVELOPER: 2,
  ADMIN: 3,
};

/**
 * 检查用户是否是Group成员
 */
export async function checkGroupMember(userId: string, groupId: string): Promise<boolean> {
  const member = await db.query.groupUsers.findFirst({
    where: and(eq(groupUsers.groupId, groupId), eq(groupUsers.userId, userId)),
  });
  return !!member;
}

/**
 * 获取用户在Group中的角色
 */
export async function getGroupRole(userId: string, groupId: string): Promise<MemberRole | null> {
  const member = await db.query.groupUsers.findFirst({
    where: and(eq(groupUsers.groupId, groupId), eq(groupUsers.userId, userId)),
    columns: {
      role: true,
    },
  });
  return (member?.role as MemberRole) || null;
}

/**
 * 检查用户在Group中是否有指定权限级别
 */
export async function checkGroupPermission(userId: string, groupId: string, minRole: MemberRole): Promise<boolean> {
  const userRole = await getGroupRole(userId, groupId);
  if (!userRole) return false;

  return ROLE_WEIGHTS[userRole] >= ROLE_WEIGHTS[minRole];
}

/**
 * 获取用户在Project中的角色（考虑继承）
 */
export async function getProjectRole(userId: string, projectId: string): Promise<MemberRole | null> {
  // 首先检查Project直接成员
  const projectMember = await db.query.projectUsers.findFirst({
    where: and(eq(projectUsers.projectId, projectId), eq(projectUsers.userId, userId)),
    columns: {
      role: true,
    },
  });

  if (projectMember) {
    return projectMember.role as MemberRole;
  }

  // 如果不是Project直接成员，检查Group继承权限
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: { groupId: true },
  });

  if (!project) return null;

  return await getGroupRole(userId, project.groupId);
}

/**
 * 检查用户在Project中是否有指定权限级别（考虑继承）
 */
export async function checkProjectPermission(userId: string, projectId: string, minRole: MemberRole): Promise<boolean> {
  const userRole = await getProjectRole(userId, projectId);
  if (!userRole) return false;

  return ROLE_WEIGHTS[userRole] >= ROLE_WEIGHTS[minRole];
}

/**
 * 获取用户有权限的Group ID列表
 */
export async function getUserGroupIds(userId: string): Promise<string[]> {
  const groups = await db.query.groupUsers.findMany({
    where: eq(groupUsers.userId, userId),
    columns: { groupId: true },
  });
  return groups.map((g) => g.groupId);
}

/**
 * 抛出权限不足错误
 */
export function throwPermissionError(message = '权限不足') {
  throw createError({
    statusCode: 403,
    message,
  });
}

/**
 * 抛出资源不存在错误
 */
export function throwNotFoundError(message = '资源不存在') {
  throw createError({
    statusCode: 404,
    message,
  });
}
