import prisma from '~~/lib/prisma';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Group ID is required' });
  }
  const group = await prisma.group.delete({
    where: { id },
  });
  return group;
});
