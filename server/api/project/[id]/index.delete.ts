import { useValidatedParams, v } from 'h3-valibot';

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));

  await prisma.$transaction(async (tx) => {
    const groups = await tx.endpointGroup.findMany({
      where: { projectId: id },
      select: { id: true },
    });
    const groupIds = groups.map((group) => group.id);

    await tx.endpoint.deleteMany({ where: { groupId: { in: groupIds } } });
    await tx.endpointGroup.deleteMany({ where: { projectId: id } });
    await tx.project.delete({ where: { id } });
  });
});
