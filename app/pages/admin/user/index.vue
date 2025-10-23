<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- 页面标题和操作 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-highlighted">用户管理</h1>
        <p class="mt-2 text-toned">管理系统中的所有用户账户</p>
      </div>
      <UButton icon="i-heroicons-plus" color="primary" @click="openCreateModal"> 创建用户 </UButton>
    </div>

    <!-- 用户统计 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <UCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <UIcon name="i-heroicons-users" size="24" class="text-blue-600 dark:text-blue-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-toned">总用户数</p>
            <p class="text-2xl font-bold text-highlighted">{{ users?.length }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <UIcon name="i-heroicons-shield-check" size="24" class="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-toned">管理员</p>
            <p class="text-2xl font-bold text-highlighted">{{ adminCount }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <UIcon name="i-heroicons-user" size="24" class="text-amber-600 dark:text-amber-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-toned">普通用户</p>
            <p class="text-2xl font-bold text-highlighted">{{ memberCount }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- 用户列表 -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-xl font-semibold text-highlighted">用户列表</h2>
          <UInput v-model="searchQuery" placeholder="搜索用户..." icon="i-heroicons-magnifying-glass" class="w-80" />
        </div>
      </template>

      <UTable :data="users" :columns="columns" :loading="loading" sticky="header" class="flex-1">
        <template #empty>
          <div class="py-8 text-center">
            <UIcon name="i-heroicons-users" class="w-12 h-12 text-dimmed mx-auto mb-4" />
            <p class="text-muted">暂无用户数据</p>
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="tsx">
import type { TableColumn } from '@nuxt/ui';
import { formatLastLoginTime } from '~/utils/date';
import { ModalConfirmDelete, UBadge, UButton } from '#components';
import ModalUserDetail from './components/ModalUserDetail.vue';
import { useDebounce } from '@vueuse/core';

// 页面标题
useHead({
  title: '用户管理',
});

// 响应式数据
const searchQuery = ref('');
const searchQueryDebounce = useDebounce(searchQuery, 300);
const { data: users, refresh: refreshUsers } = await useApi('/api/admin/user', {
  query: {
    search: searchQueryDebounce,
  },
});
type AdminUserListRes = NonNullable<typeof users.value>[number];

const loading = ref(false);

const toast = useToast();
const { user: currentUser } = useAuth();
const overlay = useOverlay();

// 创建弹窗实例
const modalUserDetail = overlay.create(ModalUserDetail);
const modalConfirmDelete = overlay.create(ModalConfirmDelete);

// 计算属性
const currentUserId = computed(() => currentUser.value?.id);

const adminCount = computed(() => users.value?.filter((u) => u.role === 'ADMIN').length);

const memberCount = computed(() => users.value?.filter((u) => u.role === 'MEMBER').length);

// 表格列定义
const columns: TableColumn<AdminUserListRes>[] = [
  {
    header: '用户信息',
    cell: ({ row }) => (
      <div class="flex items-center">
        <div class="shrink-0 h-10 w-10">
          <div class="h-10 w-10 rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span class="text-sm font-medium text-white">{row.original.username.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <div class="ml-4">
          <div class="text-sm font-medium text-highlighted">{row.original.username}</div>
          <div class="text-sm text-muted">{row.original.email}</div>
          {row.original.name && <div class="text-sm text-muted">{row.original.name}</div>}
        </div>
      </div>
    ),
  },
  {
    header: '角色',
    cell: ({ row }) => (
      <UBadge color={row.original.role === 'ADMIN' ? 'error' : 'primary'} variant="subtle">
        {row.original.role === 'ADMIN' ? '管理员' : '普通用户'}
      </UBadge>
    ),
  },
  {
    header: '创建时间',
    accessorFn: (row) =>
      new Date(row.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
  },
  { header: '最后登录', accessorFn: (row) => formatLastLoginTime(row.lastLoginAt) },
  {
    header: '操作',
    meta: {
      class: {
        th: 'text-center',
        td: 'text-center',
      },
    },
    cell: ({ row }) => (
      <>
        <UButton
          icon="i-heroicons-pencil"
          size="sm"
          variant="ghost"
          color="neutral"
          onClick={() => openEditModal(row.original)}
        />
        {row.original.id !== currentUserId.value && (
          <UButton
            icon="i-heroicons-trash"
            size="sm"
            variant="ghost"
            color="error"
            onClick={() => confirmDelete(row.original)}
          />
        )}
      </>
    ),
  },
];

const openCreateModal = async () => {
  const instance = modalUserDetail.open({
    mode: 'create',
  });

  if (await instance.result) {
    await refreshUsers();
  }
};

const openEditModal = async (user: AdminUserListRes) => {
  const instance = modalUserDetail.open({
    mode: 'edit',
    userData: user,
  });

  if (await instance.result) {
    await refreshUsers();
  }
};

const confirmDelete = async (user: AdminUserListRes) => {
  const instance = modalConfirmDelete.open({
    title: `删除用户 ${user.username}`,
    description: `确定要删除用户 ${user.username} 吗？此操作不可逆。`,
    ok: async () => {
      await http.delete(`/api/admin/user/${user.id}`);
      toast.add({
        title: '删除成功',
        description: '用户已被删除',
        color: 'success',
      });
    },
  });

  if (!(await instance.result)) {
    return;
  }

  await refreshUsers();
};
</script>
