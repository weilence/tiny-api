interface AdminUserListRes {
  id: string;
  email: string;
  username: string;
  name?: string | null;
  role: 'MEMBER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

interface AdminUserCreateReq {
  email: string;
  username: string;
  password: string;
  name?: string | null;
  role: 'MEMBER' | 'ADMIN';
}

interface AdminUserUpdateReq {
  email?: string;
  username?: string;
  name?: string | null;
  role?: 'MEMBER' | 'ADMIN';
  password?: string;
}

interface AdminUserUpdateRes {
  id: string;
  email: string;
  username: string;
  name?: string | null;
  role: 'MEMBER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
