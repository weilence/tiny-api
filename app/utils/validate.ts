import * as v from 'valibot';

export const passwordSchema = v.pipe(
  v.string(),
  v.minLength(6, '新密码至少需要6个字符')
  //   v.minLength(8, '新密码至少需要8个字符'),
  //   v.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, '密码必须包含大小写字母和数字')
);

export const roleSchema = v.picklist(['MEMBER', 'ADMIN'], '请选择用户角色');