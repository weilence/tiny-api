interface SystemInitReq {
  username: string;
  email: string;
  password: string;
  name?: string;
}

interface SystemInitRes {
  success: boolean;
  message: string;
}

interface SystemStatusRes {
  initialized: boolean;
  allowRegister: boolean;
  ldapEnabled: boolean;
}
