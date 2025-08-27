import { ilike, or } from 'drizzle-orm';
import { users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const q = (getQuery(event).query as string)?.trim() || '';
  if (q.length < 1) return [] as UserLite[];

  const usersResult = await db.query.users.findMany({
    where: or(ilike(users.username, `%${q}%`), ilike(users.email, `%${q}%`), ilike(users.name, `%${q}%`)),
    columns: {
      id: true,
      username: true,
      email: true,
      name: true,
    },
    limit: 20,
  });

  return usersResult as UserLite[];
});
