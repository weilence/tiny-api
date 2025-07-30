import prisma from '~~/lib/prisma';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID is required' });
  }

  await prisma.$transaction(async (tx) => {
    await tx.endpoint.deleteMany({
      where: { projectId: id },
    });

    await tx.project.delete({
      where: { id },
    });
  });
});
