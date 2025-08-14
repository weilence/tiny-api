export const useUser = () => {
  const { data: user, refresh: refreshUser } = useAsyncData<Serialized<UserInfo> | null>('user', () =>
    http.get('/user')
  );

  return {
    user: readonly(user),
    refreshUser,
  };
};
