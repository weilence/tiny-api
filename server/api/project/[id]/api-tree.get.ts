import { useValidatedParams, v } from 'h3-valibot';
import { asc, eq } from 'drizzle-orm';
import { endpoints, projects } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const userId = event.context.auth.user;

  // 检查用户是否有Project的访问权限（GUEST以上）
  const hasPermission = await checkProjectPermission(userId, id, 'GUEST');
  if (!hasPermission) {
    throwPermissionError('您没有权限访问此项目');
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      endpointGroup: {
        with: {
          endpoint: {
            orderBy: asc(endpoints.name),
          },
        },
        orderBy: asc(endpoints.name),
      },
    },
  });

  const groups = new Set<{ id: string; name: string }>();
  const map = new Map<string, ProjectApiTreeGetRes>();
  for (const eg of project?.endpointGroup || []) {
    groups.add({ id: eg.id, name: eg.name });
    map.set(eg.id, {
      id: eg.id,
      name: eg.name,
      description: eg.description,
      parentId: eg.parentId,
      isFolder: true,
      method: null,
      path: null,
      children: eg.endpoint.map((endpoint) => ({
        id: endpoint.id,
        name: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        description: endpoint.description,
        parentId: null,
        isFolder: false,
        children: [],
      })),
    });
  }

  const tree: ProjectApiTreeGetRes[] = [];
  for (const group of map.values()) {
    if (!group.parentId) {
      tree.push(group);
      continue;
    }

    const parent = map.get(group.parentId);
    if (!parent) {
      console.error(`Parent group with ID ${group.parentId} not found for group ${group.id}`);
      continue;
    }

    parent.children.push(group);
  }

  return { tree, groups: Array.from(groups) };
});
