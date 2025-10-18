export const useSettings = () => {
  const { data, refresh } = useApi('/api/system/status');
  return {
    settings: data,
    refreshSettings: refresh,
  };
};
