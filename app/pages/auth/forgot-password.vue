<template>
  <NuxtLayout name="auth">
    <template #header>
      <h2 class="mt-6 text-3xl font-extrabold">重置密码</h2>
      <p class="mt-2 text-sm">输入您的邮箱地址，我们将发送重置密码的链接给您</p>
    </template>

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <UFormField label="邮箱地址" name="email" required>
          <UInput v-model="state.email" type="email" placeholder="请输入注册时使用的邮箱地址" :disabled="loading" />
        </UFormField>

        <UButton type="submit" :loading="loading" size="lg" class="w-full"> 发送重置链接 </UButton>

        <div class="text-center">
          <NuxtLink to="/auth/login" class="text-link"> 返回登录页面 </NuxtLink>
        </div>
      </UForm>
    </template>

    <template #footer>
      <UCard v-if="emailSent" class="p-6 border-primary-200 bg-primary/10">
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
          <div>
            <h3 class="text-sm font-medium">邮件已发送</h3>
            <p class="text-sm mt-1">请检查您的邮箱并点击重置链接来设置新密码</p>
          </div>
        </div>
      </UCard>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import * as v from 'valibot';
import type { FormSubmitEvent } from '@nuxt/ui';

// 页面元数据
definePageMeta({
  layout: false,
  title: '忘记密码',
});

// 表单验证模式
const schema = v.object({
  email: v.pipe(v.string(), v.email('请输入有效的邮箱地址')),
});

type Schema = v.InferOutput<typeof schema>;

// 响应式状态
const state = reactive({
  email: '',
});

const loading = ref(false);
const emailSent = ref(false);
const toast = useToast();
const { forgotPassword } = useAuth();

// 表单提交处理
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;

  try {
    await forgotPassword(event.data.email);

    // 发送成功
    emailSent.value = true;
    toast.add({
      title: '邮件发送成功',
      description: '请检查您的邮箱',
      color: 'success',
    });
  } catch (error) {
    console.error('发送重置邮件失败:', error);
    toast.add({
      title: '发送失败',
      description: '发送重置邮件时出现错误，请稍后重试',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}

// 页面标题
useHead({
  title: '忘记密码 - API 文档',
});
</script>
