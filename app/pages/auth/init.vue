<script setup lang="ts">
import * as v from 'valibot';
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui';

// 页面标题
useHead({
  title: '系统初始化',
});

// 页面元数据
definePageMeta({
  layout: 'auth',
});

const loading = ref(false);
const toast = useToast();
const { refreshSettings } = useSettings();
const completed = ref(false);

// 表单验证模式
const schema = v.pipe(
  v.object({
    username: v.pipe(v.string(), v.minLength(1, '用户名不能为空'), v.maxLength(50, '用户名不能超过50个字符')),
    email: v.pipe(v.string(), v.email('请输入有效的邮箱地址')),
    password: passwordSchema,
    confirmPassword: v.string(),
    name: v.optional(v.pipe(v.string(), v.maxLength(100, '姓名不能超过100个字符'))),
  }),
  v.forward(
    v.check(({ password, confirmPassword }) => password === confirmPassword, '两次输入的密码不一致'),
    ['confirmPassword']
  )
);

type Schema = v.InferOutput<typeof schema>;

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Please enter admin email address',
    required: true,
  },
  {
    name: 'username',
    type: 'text',
    label: 'Username',
    placeholder: 'Please enter admin username',
    required: true,
  },
  {
    name: 'name',
    type: 'text',
    label: 'Name',
    placeholder: 'Please enter admin name (optional)',
    required: false,
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Please enter your password (at least 6 characters)',
    required: true,
  },
  {
    name: 'confirmPassword',
    type: 'password',
    label: 'Confirm Password',
    placeholder: 'Please re-enter your password',
    required: true,
  },
];

// 表单提交处理
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;

  try {
    const response = await http.post('/api/system/init', {
      username: event.data.username,
      email: event.data.email,
      password: event.data.password,
      name: event.data.name || event.data.username,
    });

    if (response.success) {
      await refreshSettings();
      completed.value = true;
      toast.add({
        title: '初始化成功',
        description: response.message || '管理员账户已创建',
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
      description: error?.data?.message || '系统初始化时出现错误，请稍后重试',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <!-- 初始化完成状态 -->
  <div v-if="completed" class="text-center space-y-4">
    <UIcon name="i-heroicons-check-circle" class="w-16 h-16 mx-auto text-green-500" />
    <div>
      <h3 class="text-lg font-medium mb-2">初始化完成</h3>
      <p class="text-dimmed">管理员账户已创建，正在跳转到登录页面...</p>
    </div>
    <div class="flex justify-center">
      <UButton type="button" size="lg" class="min-w-32" @click="navigateTo('/auth/login')"> 立即前往登录 </UButton>
    </div>
  </div>

  <!-- 初始化表单 -->
  <UAuthForm
    v-else
    :schema="schema"
    title="Initialize"
    description="Create the first admin account."
    icon="i-heroicons-cog-6-tooth"
    :fields="fields"
    :submit="{ loading }"
    @submit="onSubmit"
  >
    <template #description>
      This will create the first administrator with full permissions. Please keep the account information safe.
    </template>
  </UAuthForm>
</template>
