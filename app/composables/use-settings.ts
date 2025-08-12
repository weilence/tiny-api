export const useSettings = () => {
  const { data, refresh } = useAsyncData<SystemStatusRes>('settings', () => http.get('/system/status'));
  return {
    settings: data,
    refreshSettings: refresh,
  };
};
