<template>
  <NuxtLayout name="auth">
    <template #header>
      <h2 class="mt-6 text-3xl font-extrabold">登录账户</h2>
      <p class="mt-2 text-sm">
        或者
        <NuxtLink to="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
          创建新账户
        </NuxtLink>
      </p>
    </template>

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <UFormField label="登录方式" name="provider" required>
          <URadioGroup v-model="state.provider" :items="providerOptions" orientation="horizontal" />
        </UFormField>

        <UFormField label="邮箱或用户名" name="credential" required>
          <UInput v-model="state.credential" placeholder="请输入邮箱地址或用户名" :disabled="loading" class="w-full" />
        </UFormField>

        <UFormField label="密码" name="password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="请输入密码"
            :disabled="loading"
            class="w-full"
          />
        </UFormField>

        <div class="flex items-center justify-between">
          <UCheckbox v-model="state.remember" label="记住我" />
          <NuxtLink to="/auth/forgot-password" class="text-sm text-primary-600 hover:text-primary-500">
            忘记密码？
          </NuxtLink>
        </div>

        <UButton type="submit" :loading="loading" size="lg" class="w-full"> 登录 </UButton>
      </UForm>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import * as v from 'valibot';
import type { FormSubmitEvent } from '@nuxt/ui';

// 页面元数据
definePageMeta({
  layout: false,
  title: '登录',
});

// 表单验证模式
const schema = v.object({
  credential: v.pipe(v.string(), v.minLength(1, '请输入邮箱地址或用户名')),
  password: v.pipe(v.string(), v.minLength(1, '密码不能为空')),
  remember: v.optional(v.boolean(), false),
  provider: v.optional(v.picklist(['local', 'ldap']), 'local'),
});

type Schema = v.InferOutput<typeof schema>;

// 响应式状态
const state = reactive({
  credential: '',
  password: '',
  remember: false,
  provider: 'local' as 'local' | 'ldap',
});

const loading = ref(false);
const toast = useToast();
const { login } = useAuth();
const providerOptions = [
  { label: '本地账号', value: 'local' },
  { label: 'LDAP', value: 'ldap' },
];

// 表单提交处理
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;

  try {
    await login({
      credential: event.data.credential,
      password: event.data.password,
      remember: event.data.remember,
      provider: event.data.provider,
    });

    // 登录成功后的处理
    toast.add({
      title: '登录成功',
      description: '欢迎回来！',
      color: 'success',
    });

    // 重定向到首页或用户想要访问的页面
    await navigateTo('/');
  } catch (error) {
    console.error('登录失败:', error);
    toast.add({
      title: '登录失败',
      description: '请检查您的邮箱/用户名和密码',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}

// 页面标题
useHead({
  title: '登录 - API 文档',
});
</script>
