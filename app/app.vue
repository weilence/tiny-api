<script setup lang="ts">
const appConfig = useAppConfig();

useHead({
  titleTemplate: (title) => {
    return title ? `${title} - API 文档` : 'API 文档';
  },
});
</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
