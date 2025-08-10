import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));

  const body = await readBody<GroupUpdateReq>(event);
  const group = await prisma.group.update({
    where: { id },
    data: body,
  });
  return group;
});
