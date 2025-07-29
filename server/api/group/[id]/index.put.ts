import prisma from '~~/lib/prisma';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Group ID is required' });
  }

  const body = await readBody<GroupUpdateReq>(event);
  const group = await prisma.group.update({
    where: { id },
    data: body,
  });
  return group;
});
