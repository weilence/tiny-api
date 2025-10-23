<script setup lang="ts">
import * as v from 'valibot';
import type { FormSubmitEvent, AuthFormField, SelectItem } from '@nuxt/ui';

// 页面标题
useHead({
  title: '登录',
});

// 页面元数据
definePageMeta({
  layout: 'auth',
});

const loading = ref(false);
const toast = useToast();
const { login, rememberMe } = useAuth();

// 表单验证模式
const schema = v.object({
  provider: v.picklist(['local', 'ldap']),
  credential: v.pipe(v.string(), v.minLength(1, '请输入邮箱地址或用户名')),
  password: v.pipe(v.string(), v.minLength(1, '密码不能为空')),
  remember: v.boolean(),
});

type Schema = v.InferOutput<typeof schema>;

const fields: AuthFormField[] = [
  {
    name: 'provider',
    type: 'select',
    label: 'Login Method',
    placeholder: 'Select login method',
    searchInput: false,
    items: [
      { label: 'Local Account', value: 'local' },
      { label: 'LDAP', value: 'ldap' },
    ] as SelectItem[],
    // @ts-expect-error
    valueKey: 'value',
    defaultValue: 'local',
    required: true,
  },
  {
    name: 'credential',
    type: 'text',
    label: 'Email or Username',
    placeholder: 'Enter your email',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true,
  },
  {
    name: 'remember',
    label: 'Remember me',
    type: 'checkbox',
    defaultValue: rememberMe.value,
    required: true,
  },
];

// 表单提交处理
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;

  try {
    await login({
      provider: event.data.provider,
      credential: event.data.credential,
      password: event.data.password,
      remember: event.data.remember,
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
</script>

<template>
  <UAuthForm
    :schema="schema"
    title="Login"
    description="Enter your credentials to access your account."
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
    <template #footer>
      <ULink to="/auth/forgot-password" class="text-primary hover:text-primary-500">
        Forgot password?
      </ULink>
    </template>
  </UAuthForm>
</template>
