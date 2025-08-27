import { eq } from 'drizzle-orm';
import { users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.user;
  const req = await readBody<UserUpdateReq>(event);
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) {
    throw createError({
      statusCode: 400,
      message: '用户不存在',
    });
  }

  await db
    .update(users)
    .set({
      username: req.username,
      email: req.email,
      name: req.name,
    })
    .where(eq(users.id, userId));
});
