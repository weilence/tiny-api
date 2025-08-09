<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const { user, isLoggedIn, logout } = useAuth();

// 计算菜单项
const userMenuItems = computed(() => {
  const items: DropdownMenuItem[][] = [
    [
      {
        label: user.value?.email || '',
        slot: 'account',
        disabled: true,
      },
    ],
  ];

  const settingsItems: DropdownMenuItem[] = [
    {
      label: '个人设置',
      icon: 'i-heroicons-cog-6-tooth',
      onSelect: () => navigateTo('/account/profile'),
    },
  ];

  // 如果是管理员，添加用户管理菜单
  if (user.value?.role === 'ADMIN') {
    settingsItems.push(
      {
        label: '用户管理',
        icon: 'i-heroicons-users',
        onSelect: () => navigateTo('/admin/user'),
      },
      {
        label: '系统设置',
        icon: 'i-heroicons-cog-6-tooth',
        onSelect: () => navigateTo('/admin/settings'),
      }
    );
  }

  settingsItems.push({
    label: '退出登录',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    onSelect: logout,
  });

  items.push(settingsItems);

  return items;
});
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
