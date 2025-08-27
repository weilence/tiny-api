import { eq } from 'drizzle-orm';
import { users } from '~~/server/db/schema';
import { getAllowRegister } from '../../utils/settings';

export default defineEventHandler(async (event) => {
  const allow = await getAllowRegister();
  // 检查是否允许注册
  if (!allow) {
    throw createError({
      statusCode: 400,
      message: '管理员已禁止注册，请联系管理员',
    });
  }

  const req = await readBody<UserRegisterReq>(event);

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, req.email),
  });
  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: '邮箱已被注册',
    });
  }

  const hashedPassword = await hashPassword(req.password);

  await db.insert(users).values({
    email: req.email,
    username: req.username,
    password: hashedPassword,
  });
});
