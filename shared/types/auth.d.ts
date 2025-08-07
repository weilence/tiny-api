interface UserRegisterReq {
  email: string;
  username: string;
  password: string;
}

interface UserLoginReq {
  credential: string; // 邮箱或用户名
  password: string;
}

interface UserInfo {
  id: string;
  email: string;
  username: string;
  name?: string;
  role?: 'MEMBER' | 'ADMIN';
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserLoginRes extends UserInfo {
  token: string;
}
