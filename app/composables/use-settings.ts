const settings = ref<Partial<SystemStatusRes>>({});

export const useSettings = () => {
  const initSettings = async () => {
    settings.value = (await http.get('/system/status')) || {};
  };

  return {
    settings,
    initSettings,
  };
};
