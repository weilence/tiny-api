import redisDriver from 'unstorage/drivers/redis';

export default defineNitroPlugin(() => {
  const storage = useStorage();

  const driver = redisDriver({
    ...useRuntimeConfig().redis,
    base: 'redis',
  });

  storage.mount('redis', driver);
});
