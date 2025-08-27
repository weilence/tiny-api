import { useValidatedParams, v } from 'h3-valibot';
import { eq } from 'drizzle-orm';
import { projects } from '~~/server/db/schema';

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
          endpoint: true,
        },
      },
    },
  });

  const egm = new Map<string, ProjectGetResEndpointGroup>();
  for (const eg of project?.endpointGroup || []) {
    egm.set(eg.id, {
      id: eg.id,
      name: eg.name,
      description: eg.description,
      createdAt: eg.createdAt,
      updatedAt: eg.updatedAt,
      children: [],
      parentId: eg.parentId || null,
      endpoints: eg.endpoint.map((endpoint) => ({
        id: endpoint.id,
        name: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        description: endpoint.description,
        tags: endpoint.tags || [],
        headers: endpoint.headers || [],
        queryParams: endpoint.queryParams || [],
        body: endpoint.body,
        response: endpoint.response,
        createdAt: endpoint.createdAt,
        updatedAt: endpoint.updatedAt,
      })),
    });
  }

  const endpointGroups: ProjectGetResEndpointGroup[] = [];
  for (const group of egm.values()) {
    if (!group.parentId) {
      endpointGroups.push(group);
      continue;
    }

    const parent = egm.get(group.parentId);
    if (!parent) {
      console.error(`Parent group with ID ${group.parentId} not found for group ${group.id}`);
      continue;
    }

    parent.children.push(group);
  }

  return {
    id: project?.id || '',
    name: project?.name || '',
    description: project?.description || null,
    icon: project?.icon || null,
    groupId: project?.groupId || '',
    endpointGroups: endpointGroups,
    createdAt: project?.createdAt || new Date(),
    updatedAt: project?.updatedAt || new Date(),
  } as ProjectGetRes;
});
