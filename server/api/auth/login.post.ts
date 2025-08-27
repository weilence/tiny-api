import { v4 as uuidv4 } from 'uuid';
import { eq, or } from 'drizzle-orm';
import { users } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  const req = await readBody<UserLoginReq>(event);
  const provider = req.provider ?? 'local';

  if (provider === 'ldap') {
    const ldapCfg = await getLdapConfig();
    if (!ldapCfg?.enabled) {
      throw createError({ statusCode: 400, message: '未启用 LDAP 登录' });
    }

    // 1) 通过 LDAP 校验
    const profile = await ldapAuthenticate(req.credential, req.password);
    if (!profile) {
      throw createError({ statusCode: 400, message: '用户不存在或密码错误' });
    }

    // 2) 在本地查找或创建用户（不修改数据模型）
    const username = profile.username || req.credential;
    // 优先用邮箱匹配，否则用户名
    let user = await db.query.users.findFirst({
      where: profile.email
        ? or(eq(users.email, profile.email), eq(users.username, username))
        : eq(users.username, username),
    });

    if (!user) {
      // 初次登录自动创建，密码存随机不可用占位（不用于本地登录）
      const placeholder = uuidv4();
      const email =
        profile.email ||
        `${username}@${ldapCfg.baseDn
          .split(',')
          .map((m) => m.split('=')[1])
          .filter(Boolean)
          .join('.')}`;

      const [newUser] = await db
        .insert(users)
        .values({
          email: email,
          username,
          password: await hashPassword(placeholder),
          name: profile.name || profile.username,
          // 角色默认 MEMBER（与 schema 默认一致）
        })
        .returning();
      user = newUser;
    } else {
      // 同步资料
      const [updatedUser] = await db
        .update(users)
        .set({
          name: profile.name ?? user.name,
          email: profile.email ?? user.email,
          lastLoginAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
      user = updatedUser;
    }

    // 更新最后登录时间（若上面未更新）
    if (!user.lastLoginAt) {
      const [updatedUser] = await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
      user = updatedUser;
    }
    const token = uuidv4().replace(/-/g, '').toLowerCase();
    await redis.setUserSession(token, user.id, 3600);

    return {
      id: user.id,
      token,
      email: user.email,
      username: user.username,
      name: user.name ?? undefined,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } satisfies UserLoginRes;
  }

  // local 登录：与原逻辑一致
  const isEmail = req.credential.includes('@');
  const user = await db.query.users.findFirst({
    where: isEmail ? eq(users.email, req.credential) : eq(users.username, req.credential),
  });

  if (!user) {
    throw createError({ statusCode: 400, message: '用户不存在' });
  }

  if (!(await verifyPassword(user.password, req.password))) {
    throw createError({ statusCode: 400, message: '密码错误' });
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
    })
    .where(eq(users.id, user.id))
    .returning();
  const token = uuidv4().replace(/-/g, '').toLowerCase();
  await redis.setUserSession(token, user.id, 3600);

  return {
    id: updatedUser.id,
    token: token,
    email: updatedUser.email,
    username: updatedUser.username,
    name: updatedUser.name ?? undefined,
    role: updatedUser.role,
    lastLoginAt: updatedUser.lastLoginAt,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  } as UserLoginRes;
});
