import argon2 from 'argon2';

export async function hashPassword(password: string) {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id, // 使用 Argon2id
      memoryCost: 2 ** 16, // 内存成本：65536 KB = 64 MB
      timeCost: 3, // 迭代次数
      parallelism: 1, // 并行度
    });
    return hash; // 保存到数据库
  } catch (err) {
    console.error('密码哈希失败:', err);
    throw err;
  }
}

// 验证密码
export async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error('密码验证失败:', err);
    return false;
  }
}
