export default defineEventHandler(async (event) => {
  const { q } = getQuery(event) as { q?: string };

  const users: AdminUserListRes[] = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
});
