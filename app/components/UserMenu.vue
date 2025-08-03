<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const { user, isLoggedIn, logout } = useAuth();

// 用户菜单项
const userMenuItems: DropdownMenuItem[][] = [
  [
    {
      label: user.value?.email || '',
      slot: 'account',
      disabled: true,
    },
  ],
  [
    {
      label: '个人设置',
      icon: 'i-heroicons-cog-6-tooth',
      onSelect: () => navigateTo('/account/profile'),
    },
    {
      label: '退出登录',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      onSelect: logout,
    },
  ],
];
</script>

<template>
  <UDropdownMenu v-if="isLoggedIn" :items="userMenuItems">
    <UButton variant="ghost" :label="user?.username || '用户'" trailing-icon="i-heroicons-chevron-down-20-solid" />
  </UDropdownMenu>

  <div v-else class="flex items-center space-x-2">
    <UButton to="/auth/login" variant="ghost" size="sm"> 登录 </UButton>
    <UButton to="/auth/register" variant="solid" size="sm"> 注册 </UButton>
  </div>
</template>
