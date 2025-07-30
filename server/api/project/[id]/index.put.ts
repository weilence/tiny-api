import prisma from '~~/lib/prisma';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID is required' });
  }

  const body = await readBody<ProjectUpdateReq>(event);
  const project = await prisma.project.update({
    where: { id },
    data: body,
  });
  return project;
});
