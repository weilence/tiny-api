import type { AuthenticationOptions } from 'ldap-authentication';
import { authenticate } from 'ldap-authentication';
import { getLdapConfig } from './settings';

interface LdapProfile {
  username: string;
  name?: string;
  email?: string;
  dn: string;
}

export async function ldapAuthenticate(username: string, password: string): Promise<LdapProfile | null> {
  const ldapCfg = await getLdapConfig();
  if (!ldapCfg || ldapCfg.enabled !== true) return null;

  const usernameAttr = ldapCfg.usernameAttr || 'sAMAccountName';
  const nameAttr = ldapCfg.nameAttr || 'cn';
  const emailAttr = ldapCfg.emailAttr || 'mail';

  const options: AuthenticationOptions = {
    ldapOpts: {
      url: ldapCfg.url,
      connectTimeout: ldapCfg.timeoutMs,
    },
    userPassword: password,
    userSearchBase: ldapCfg.baseDn,
    username,
    usernameAttribute: usernameAttr,
    attributes: [usernameAttr, nameAttr, emailAttr],
  };

  if (ldapCfg.adminDn && ldapCfg.adminPassword) {
    options.adminDn = ldapCfg.adminDn;
    options.adminPassword = ldapCfg.adminPassword;
  } else {
    options.userDn = username;
    if (username.includes('@')) {
      const [realUsername, domain] = username.split('@', 2);
      options.username = realUsername;
      if (!options.userSearchBase) {
        options.userSearchBase = domain
          .split('.')
          .map((m) => 'dc=' + m)
          .join(',');
      }
    }
  }

  try {
    const user: any = await authenticate(options);
    if (!user) return null;

    const uname = user[usernameAttr] || username;
    const name = user[nameAttr];
    const email = user[emailAttr];
    const dn = user.dn;

    return {
      username: Array.isArray(uname) ? uname[0] : uname,
      name: Array.isArray(name) ? name[0] : name,
      email: Array.isArray(email) ? email[0] : email,
      dn,
    };
  } catch (e: any) {
    console.error('LDAP authentication error:', e);
    return null;
  }
}
