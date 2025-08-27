import { ilike, or, desc } from 'drizzle-orm';
import { users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event) as { q?: string };

  const usersResult: AdminUserListRes[] = await db.query.users.findMany({
    where: q
      ? or(ilike(users.username, `%${q}%`), ilike(users.email, `%${q}%`), ilike(users.name, `%${q}%`))
      : undefined,
    columns: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: desc(users.createdAt),
  });

  return usersResult;
});
