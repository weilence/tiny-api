interface UserUpdateReq {
  email?: string;
  username?: string;
  name?: string;
}

interface UserUpdatePasswordReq {
  oldPassword: string;
  newPassword: string;
}
