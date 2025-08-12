export default defineNuxtPlugin(async () => {
  const { refreshSettings } = useSettings();
  await refreshSettings();
});
