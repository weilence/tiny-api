export const getColor = (method: PrismaJson.HttpMethod) => {
  const colors = {
    get: 'success' as const,
    post: 'primary' as const,
    put: 'warning' as const,
    delete: 'error' as const,
    patch: 'secondary' as const,
  } as const;

  return colors[method] || 'neutral';
};
