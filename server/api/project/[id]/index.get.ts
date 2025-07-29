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

  return project;
});
