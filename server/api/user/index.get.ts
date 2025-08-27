import { eq } from 'drizzle-orm';
import { users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.user;
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) {
    throw createError({
      statusCode: 400,
      message: '用户不存在',
    });
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as UserInfo;
});
