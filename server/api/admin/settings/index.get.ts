import { asc } from 'drizzle-orm';
import { settings } from '~~/server/db/schema';

export default defineEventHandler(async () => {
  const rows = await db.query.settings.findMany({
    orderBy: asc(settings.createdAt),
  });
  return rows as unknown as AdminSettingListRes;
});
