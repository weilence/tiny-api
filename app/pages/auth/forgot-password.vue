<script setup lang="ts">
import * as v from 'valibot';
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui';

// 页面标题
useHead({
  title: '忘记密码',
});

// 页面元数据
definePageMeta({
  layout: 'auth',
});

// 表单验证模式
const schema = v.object({
  email: v.pipe(v.string(), v.email('请输入有效的邮箱地址')),
});

type Schema = v.InferOutput<typeof schema>;

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Please enter your email address',
    required: true,
  },
];

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
</script>

<template>
  <UAuthForm
    v-if="!emailSent"
    :schema="schema"
    title="Forgot Password"
    description="Enter your email to reset your password."
    icon="i-lucide-user"
    :fields="fields"
    @submit="onSubmit"
    :submit="{
      loading: loading,
    }"
  >
    <template #description>
      Don't have an account? <ULink to="/auth/register" class="text-primary hover:text-primary-500">Sign up</ULink>.
    </template>
  </UAuthForm>
  <div v-else class="flex items-center space-x-4">
    <UIcon name="i-heroicons-check-circle" class="size-8" />
    <div class="space-y-1">
      <h3 class="font-medium">Email has been sent</h3>
      <p>Please check your email and click the reset link to set a new password.</p>
      <ULink to="/auth/login" class="text-primary hover:text-primary-500 block">Return to Login</ULink>
    </div>
  </div>

  <!-- <NuxtLayout name="auth">
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
        
      </UCard>
    </template>
  </NuxtLayout> -->
</template>
