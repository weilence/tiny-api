import { eq } from 'drizzle-orm';
import { settings } from '~~/server/db/schema';

const DEFAULT_LDAP = {
  enabled: false,
  url: '',
  baseDn: '',
  adminDn: '',
  adminPassword: '',
  usernameAttr: 'uid',
  nameAttr: 'cn',
  emailAttr: 'mail',
  tlsRejectUnauthorized: false,
  timeoutMs: 5000,
};

export async function getAllowRegister(): Promise<boolean> {
  const setting = await db.query.settings.findFirst({
    where: eq(settings.key, 'allowRegister'),
  });
  if (setting && typeof setting.value === 'boolean') {
    return setting.value as boolean;
  }
  return false; // default: not allowed
}

export async function getLdapConfig(): Promise<typeof DEFAULT_LDAP> {
  const setting = await db.query.settings.findFirst({
    where: eq(settings.key, 'ldap'),
  });
  if (setting && typeof setting.value === 'object' && setting.value) {
    return { ...DEFAULT_LDAP, ...(setting.value as object) } as any;
  }
  return { ...DEFAULT_LDAP };
}
