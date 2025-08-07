<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- 页面标题和操作 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">用户管理</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">管理系统中的所有用户账户</p>
      </div>
      <UButton icon="i-heroicons-plus" color="primary" @click="openCreateModal"> 创建用户 </UButton>
    </div>

    <!-- 用户统计 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <UCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
            <UIcon name="i-heroicons-users" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">总用户数</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ users.length }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">管理员</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ adminCount }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50">
            <UIcon name="i-heroicons-user" class="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">普通用户</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ memberCount }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- 用户列表 -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">用户列表</h2>
          <UInput v-model="searchQuery" placeholder="搜索用户..." icon="i-heroicons-magnifying-glass" class="w-80" />
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                用户信息
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                角色
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                创建时间
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                最后登录
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div
                      class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-white">
                        {{ user.username.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.username }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                    <div v-if="user.name" class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge :color="user.role === 'ADMIN' ? 'error' : 'primary'" variant="subtle">
                  {{ user.role === 'ADMIN' ? '管理员' : '普通用户' }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatLastLoginTime(user.lastLoginAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <UButton
                    icon="i-heroicons-pencil"
                    size="sm"
                    variant="ghost"
                    color="neutral"
                    @click="openEditModal(user)"
                  />
                  <UButton
                    v-if="user.id !== currentUserId"
                    icon="i-heroicons-trash"
                    size="sm"
                    variant="ghost"
                    color="error"
                    @click="confirmDelete(user)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredUsers.length === 0" class="text-center py-8">
        <UIcon name="i-heroicons-users" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">暂无用户数据</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { formatLastLoginTime } from '~/utils/date';
import { ModalConfirmDelete } from '#components';
import ModalUserDetail from './components/ModalUserDetail.vue';

// 页面元数据
definePageMeta({
  title: '用户管理',
});

// 响应式数据
const users = ref<AdminUserListRes[]>([]);
const loading = ref(false);
const searchQuery = ref('');

const toast = useToast();
const { user: currentUser } = useAuth();
const overlay = useOverlay();

// 创建弹窗实例
const modalUserDetail = overlay.create(ModalUserDetail);
const modalConfirmDelete = overlay.create(ModalConfirmDelete);

// 计算属性
const currentUserId = computed(() => currentUser.value?.id);

const adminCount = computed(() => users.value.filter((u) => u.role === 'ADMIN').length);

const memberCount = computed(() => users.value.filter((u) => u.role === 'MEMBER').length);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;

  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.name && user.name.toLowerCase().includes(query))
  );
});

// 方法
const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await http.get('/admin/user');
  } catch (error) {
    console.error('加载用户列表失败:', error);
    toast.add({
      title: '加载失败',
      description: '无法加载用户列表',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
};

const openCreateModal = async () => {
  const instance = modalUserDetail.open({
    mode: 'create',
  });

  if (await instance.result) {
    await loadUsers();
  }
};

const openEditModal = async (user: AdminUserListRes) => {
  const instance = modalUserDetail.open({
    mode: 'edit',
    userData: user,
  });

  if (await instance.result) {
    await loadUsers();
  }
};

const confirmDelete = async (user: AdminUserListRes) => {
  const instance = modalConfirmDelete.open({
    title: `删除用户 ${user.username}`,
    description: `确定要删除用户 ${user.username} 吗？此操作不可逆。`,
    ok: async () => {
      await http.delete(`/admin/user/${user.id}`);
    },
  });

  if (await instance.result) {
    await loadUsers(); // 只需要刷新列表，删除操作已在模态框中完成

    toast.add({
      title: '删除成功',
      description: '用户已被删除',
      color: 'success',
    });
  }
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 页面加载时获取数据
onMounted(() => {
  loadUsers();
});

// 页面标题
useHead({
  title: '用户管理 - API 文档',
});
</script>
