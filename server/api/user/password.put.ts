import { eq } from 'drizzle-orm';
import { users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.user;
  const req = await readBody<UserUpdatePasswordReq>(event);
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) {
    throw createError({
      statusCode: 400,
      message: '用户不存在',
    });
  }

  if (!(await verifyPassword(user.password, req.oldPassword))) {
    throw createError({
      statusCode: 400,
      message: '旧密码错误',
    });
  }

  const newPasswordHash = await hashPassword(req.newPassword);
  await db
    .update(users)
    .set({
      password: newPasswordHash,
    })
    .where(eq(users.id, userId));

  return {
    success: true,
    message: '密码修改成功',
  };
});
