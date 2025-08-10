import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));

  const group = await prisma.group.delete({
    where: { id },
  });
  return group;
});
