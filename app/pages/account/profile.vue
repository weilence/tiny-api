<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">个人资料</h1>
      <p class="text-gray-600 dark:text-gray-400">管理您的账户信息和设置</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 用户信息卡片 -->
      <UCard class="lg:col-span-2">
        <template #header>
          <h2 class="text-xl font-semibold">基本信息</h2>
        </template>

        <div class="space-y-6">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-user" class="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ user?.username || '用户' }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                {{ user?.email }}
              </p>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 my-6" />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> 用户名 </label>
              <UInput v-model="profileForm.username" :disabled="!editing" placeholder="输入用户名" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> 邮箱地址 </label>
              <UInput v-model="profileForm.email" type="email" :disabled="!editing" placeholder="输入邮箱地址" />
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <UButton v-if="editing" variant="outline" @click="cancelEdit"> 取消 </UButton>
            <UButton v-if="editing" :loading="saving" @click="saveProfile"> 保存更改 </UButton>
            <UButton v-else @click="startEdit"> 编辑资料 </UButton>
          </div>
        </div>
      </UCard>

      <!-- 侧边栏 -->
      <div class="space-y-6">
        <!-- 账户统计 -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">账户统计</h3>
          </template>

          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">注册时间</span>
              <span class="font-medium">{{ user?.createdAt }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">最后登录</span>
              <span class="font-medium">今天</span>
            </div>
          </div>
        </UCard>

        <!-- 快捷操作 -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">快捷操作</h3>
          </template>

          <div class="space-y-3">
            <UButton variant="outline" size="sm" class="w-full justify-start" icon="i-heroicons-key">
              修改密码
            </UButton>
            <UButton variant="outline" size="sm" class="w-full justify-start" icon="i-heroicons-shield-check">
              安全设置
            </UButton>
            <UButton
              variant="outline"
              size="sm"
              class="w-full justify-start"
              icon="i-heroicons-arrow-right-on-rectangle"
              color="error"
              @click="handleLogout"
            >
              退出登录
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout, refreshUser } = useAuth();
const toast = useToast();

// 表单数据
const profileForm = reactive({
  username: user.value?.username || '',
  email: user.value?.email || '',
});

// 状态
const editing = ref(false);
const saving = ref(false);

// 开始编辑
function startEdit() {
  editing.value = true;
  // 重置表单数据
  profileForm.username = user.value?.username || '';
  profileForm.email = user.value?.email || '';
}

// 取消编辑
function cancelEdit() {
  editing.value = false;
  // 重置表单数据
  profileForm.username = user.value?.username || '';
  profileForm.email = user.value?.email || '';
}

// 保存资料
async function saveProfile() {
  saving.value = true;

  try {
    await http.put(`/user`, {
      username: profileForm.username,
      email: profileForm.email,
    });

    toast.add({
      title: '保存成功',
      description: '您的资料已更新',
      color: 'success',
    });

    editing.value = false;
  } catch (error) {
    console.error('保存失败:', error);
    toast.add({
      title: '保存失败',
      description: '更新资料时出现错误',
      color: 'error',
    });
  } finally {
    saving.value = false;
    refreshUser();
  }
}

// 退出登录
function handleLogout() {
  logout();
}

// 页面标题
useHead({
  title: '个人资料 - API 文档',
});
</script>
