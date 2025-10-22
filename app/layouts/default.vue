<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Project',
    to: '/group',
  },
  {
    label: 'Profile',
    to: '/account/profile',
  },
]);
</script>

<template>
  <div>
    <UHeader>
      <template #title>
        <h1 class="text-2xl font-bold">API Doc</h1>
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
        <UColorModeButton />
        <UserMenu />
      </template>
    </UHeader>

    <UMain class="p-6">
      <UContainer>
        <slot />
      </UContainer>
    </UMain>
  </div>
</template>
