export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Group ID is required' });
  }
  const group = await prisma.group.delete({
    where: { id },
  });
  return group;
});
