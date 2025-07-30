import prisma from '~~/lib/prisma';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID is required' });
  }

  const project = await prisma.project.findUnique({
    where: {
      id: id,
    },
    include: {
      endpoints: true,
    },
  });

  project?.endpoints.sort((a, b) => {
    return a.path.localeCompare(b.path) || a.method.localeCompare(b.method);
  });

  return project as ProjectGetRes | null;
});
