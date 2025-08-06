interface UserRegisterReq {
  email: string;
  username: string;
  password: string;
}

interface UserLoginReq {
  email: string;
  password: string;
}

interface UserInfo {
  id: string;
  email: string;
  username: string;
  name?: string;
  role?: 'MEMBER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

interface UserLoginRes extends UserInfo {
  token: string;
}
