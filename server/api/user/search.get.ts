export default defineEventHandler(async (event) => {
  const q = (getQuery(event).query as string)?.trim() || '';
  if (q.length < 1) return [] as UserLite[];

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, username: true, email: true, name: true },
    take: 20,
  });

  return users as UserLite[];
});
