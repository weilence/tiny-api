export default defineEventHandler(async (_event) => {
  const body = await readBody<GroupCreateReq>(_event);
  const group = await prisma.group.create({
    data: body,
  });
  return group;
});
