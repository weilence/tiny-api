export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth();
  await initAuth();
  const { initSettings } = useSettings();
  await initSettings();
});
