import { eq } from 'drizzle-orm';
import { users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody<AdminUserCreateReq>(event);

  // 检查邮箱是否已存在
  const existingUserByEmail = await db.query.users.findFirst({
    where: eq(users.email, body.email),
  });

  if (existingUserByEmail) {
    throw createError({
      statusCode: 400,
      message: '邮箱已被使用',
    });
  }

  // 检查用户名是否已存在
  const existingUserByUsername = await db.query.users.findFirst({
    where: eq(users.username, body.username),
  });

  if (existingUserByUsername) {
    throw createError({
      statusCode: 400,
      message: '用户名已被使用',
    });
  }

  // 创建新用户
  const hashedPassword = await hashPassword(body.password);

  const [newUser] = await db
    .insert(users)
    .values({
      email: body.email,
      username: body.username,
      password: hashedPassword,
      name: body.name,
      role: body.role,
    })
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return newUser;
});
