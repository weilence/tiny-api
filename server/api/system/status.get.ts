import { count } from 'drizzle-orm';
import { users } from '~~/server/db/schema';

export default defineEventHandler(async (_event) => {
  // 检查系统是否已初始化（通过检查用户数量）
  const [{ userCount }] = await db.select({ userCount: count() }).from(users);
  const allowRegister = await getAllowRegister();
  const ldapConfig = await getLdapConfig();

  return {
    initialized: userCount > 0,
    allowRegister,
    ldapEnabled: ldapConfig.enabled,
  } as SystemStatusRes;
});
