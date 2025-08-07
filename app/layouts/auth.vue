<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6">
      <div class="text-center">
        <slot name="header" />
      </div>

      <UCard class="p-6">
        <slot name="body" />
      </UCard>

      <div class="text-center">
        <slot name="footer" />
      </div>

      <div class="text-center">
        <UButton
          :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
          color="primary"
          variant="link"
          size="xl"
          @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
});

const colorMode = useColorMode();
</script>
