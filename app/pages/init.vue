<script setup lang="ts">
import * as v from 'valibot';
import type { FormSubmitEvent } from '@nuxt/ui';

// 页面元数据
definePageMeta({
  layout: false,
  title: '系统初始化',
});

// 表单验证模式
const schema = v.pipe(
  v.object({
    username: v.pipe(v.string(), v.minLength(1, '用户名不能为空'), v.maxLength(50, '用户名不能超过50个字符')),
    email: v.pipe(v.string(), v.email('请输入有效的邮箱地址')),
    password: v.pipe(v.string(), v.minLength(6, '密码至少需要6位字符')),
    confirmPassword: v.string(),
    name: v.optional(v.pipe(v.string(), v.maxLength(100, '姓名不能超过100个字符'))),
  }),
  v.forward(
    v.check(({ password, confirmPassword }) => password === confirmPassword, '两次输入的密码不一致'),
    ['confirmPassword']
  )
);

type Schema = v.InferOutput<typeof schema>;

// 响应式状态
const state = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
});

const loading = ref(false);
const completed = ref(false);
const toast = useToast();

// 检查系统状态
const systemStatus = await http.get('/system/status').catch(() => {
  return { initialized: false, userCount: 0 };
});

// 如果系统已初始化，重定向到登录页面
if (systemStatus?.initialized) {
  await navigateTo('/auth/login');
}

// 表单提交处理
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;

  try {
    const response = await http.post('/system/init', {
      username: event.data.username,
      email: event.data.email,
      password: event.data.password,
      name: event.data.name || event.data.username,
    });

    if (response.success) {
      completed.value = true;
      toast.add({
        title: '初始化成功',
        description: response.message,
        color: 'success',
      });

      // 3秒后跳转到登录页面
      setTimeout(() => {
        navigateTo('/auth/login');
      }, 3000);
    }
  } catch (error: any) {
    console.error('初始化失败:', error);
    toast.add({
      title: '初始化失败',
      description: error.data?.message || '系统初始化时出现错误，请稍后重试',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}

// 页面标题
useHead({
  title: '系统初始化 - API 文档',
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div
          class="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-6"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 class="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ completed ? '初始化完成' : '系统初始化' }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {{ completed ? '正在跳转到登录页面...' : '创建系统管理员账户' }}
        </p>
      </div>

      <UCard class="p-6">
        <!-- 初始化完成状态 -->
        <div v-if="completed" class="text-center space-y-4">
          <UIcon name="i-heroicons-check-circle" class="w-16 h-16 mx-auto text-green-500" />
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">系统初始化成功</h3>
            <p class="text-gray-600 dark:text-gray-400">管理员账户已创建，即将跳转到登录页面</p>
          </div>
          <div class="flex justify-center">
            <UButton to="/auth/login" size="lg" class="min-w-32"> 立即登录 </UButton>
          </div>
        </div>

        <!-- 初始化表单 -->
        <UForm v-else :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
          <div class="space-y-1">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">管理员账户信息</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">请创建系统的第一个管理员账户</p>
          </div>

          <UFormField label="用户名" name="username" required>
            <UInput
              v-model="state.username"
              type="text"
              placeholder="请输入管理员用户名"
              :disabled="loading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="邮箱地址" name="email" required>
            <UInput
              v-model="state.email"
              type="email"
              placeholder="请输入管理员邮箱地址"
              :disabled="loading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="姓名" name="name">
            <UInput
              v-model="state.name"
              type="text"
              placeholder="请输入管理员姓名（可选）"
              :disabled="loading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="密码" name="password" required>
            <UInput
              v-model="state.password"
              type="password"
              placeholder="请输入密码（至少6位）"
              :disabled="loading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="确认密码" name="confirmPassword" required>
            <UInput
              v-model="state.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              :disabled="loading"
              class="w-full"
            />
          </UFormField>

          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-blue-700 dark:text-blue-300">
                <p class="font-medium mb-1">重要提示：</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>这是系统的第一个用户，将拥有管理员权限</li>
                  <li>请妥善保管账户信息</li>
                  <li>初始化完成后无法重复执行</li>
                </ul>
              </div>
            </div>
          </div>

          <UButton type="submit" :loading="loading" size="lg" class="w-full" :disabled="loading">
            {{ loading ? '正在初始化...' : '创建管理员账户' }}
          </UButton>
        </UForm>
      </UCard>

      <div class="text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400">系统初始化后，您可以使用此账户登录并管理系统</p>
      </div>
    </div>
  </div>
</template>
