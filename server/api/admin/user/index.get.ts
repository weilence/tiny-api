import { ilike, or, desc } from 'drizzle-orm';
import { users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const { search } = getQuery(event) as { search?: string };

  const usersResult = await db.query.users.findMany({
    where: search
      ? or(ilike(users.username, `%${search}%`), ilike(users.email, `%${search}%`), ilike(users.name, `%${search}%`))
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
