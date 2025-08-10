import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));

  const body = await readBody<ProjectUpdateReq>(event);
  const project = await prisma.project.update({
    where: { id },
    data: body,
  });
  return project;
});
