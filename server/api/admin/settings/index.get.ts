export default defineEventHandler(async () => {
  const rows = await prisma.setting.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return rows as unknown as AdminSettingListRes;
});
