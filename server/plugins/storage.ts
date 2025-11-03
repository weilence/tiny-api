import redisDriver from 'unstorage/drivers/redis';

export default defineNitroPlugin(() => {
  const storage = useStorage();

  const driver = redisDriver({
    url: useRuntimeConfig().redisUrl,
    base: 'redis',
  });

  storage.mount('redis', driver);
});
