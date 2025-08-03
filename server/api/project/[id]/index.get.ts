export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID is required' });
  }

  const project = await prisma.project.findUnique({
    where: {
      id: id,
    },
    include: {
      endpointGroups: {
        include: {
          endpoints: true,
        },
      },
    },
  });

  const egm = new Map<string, ProjectGetResEndpointGroup>();
  for (const eg of project?.endpointGroups || []) {
    egm.set(eg.id, {
      id: eg.id,
      name: eg.name,
      description: eg.description,
      createdAt: eg.createdAt,
      updatedAt: eg.updatedAt,
      children: [],
      parentId: eg.parentId || null,
      endpoints: eg.endpoints.map((endpoint) => ({
        id: endpoint.id,
        name: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        description: endpoint.description,
        tags: endpoint.tags,
        headers: endpoint.headers,
        queryParams: endpoint.queryParams,
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
    groupId: project?.groupId || '',
    endpointGroups: endpointGroups,
    createdAt: project?.createdAt || new Date(),
    updatedAt: project?.updatedAt || new Date(),
  } as ProjectGetRes;
});
