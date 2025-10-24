<script setup lang="ts">
import * as v from 'valibot';
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui';

// 页面标题
useHead({
  title: '注册',
});

// 页面元数据
definePageMeta({
  layout: 'auth',
});

// 获取运行时配置
const { settings } = useSettings();

// 表单验证模式
const schema = v.pipe(
  v.object({
    username: v.pipe(v.string(), v.minLength(1, '用户名不能为空')),
    email: v.pipe(v.string(), v.email('请输入有效的邮箱地址')),
    password: passwordSchema,
    confirmPassword: v.string(),
    // agreeToTerms: v.pipe(v.boolean(), v.literal(true, '请同意服务条款和隐私政策')),
  }),
  v.forward(
    v.check(({ password, confirmPassword }) => password === confirmPassword, '两次输入的密码不一致'),
    ['confirmPassword']
  )
);

type Schema = v.InferOutput<typeof schema>;

const fields: AuthFormField[] = [
  {
    name: 'username',
    type: 'text',
    label: 'Username',
    placeholder: 'Please enter your username',
    required: true,
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Please enter your email address',
    required: true,
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
  // {
  //   name: 'agreeToTerms',
  //   type: 'checkbox',
  //   label: 'I agree to the Terms of Service and Privacy Policy',
  //   required: true,
  // },
];

const loading = ref(false);
const toast = useToast();
const { register } = useAuth();

// 表单提交处理
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;

  try {
    await register({
      username: event.data.username,
      email: event.data.email,
      password: event.data.password,
    });

    // 注册成功后的处理
    toast.add({
      title: '注册成功',
      description: '账户创建成功，欢迎加入！',
      color: 'success',
    });

    // 重定向到登录页面
    await navigateTo('/auth/login');
  } catch (error) {
    console.error('注册失败:', error);
    toast.add({
      title: '注册失败',
      description: '创建账户时出现错误，请稍后重试',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UAuthForm
    v-if="settings?.allowRegister"
    :schema="schema"
    title="Register"
    description="Enter your credentials to create your account."
    icon="i-lucide-user"
    :fields="fields"
    :submit="{
      loading: loading,
    }"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account? <ULink to="/auth/login" class="text-primary hover:text-primary-500">Log in</ULink>.
    </template>
  </UAuthForm>
  <div v-else class="text-center space-y-4">
    <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 mx-auto text-warning" />
    <div>
      <h3 class="text-lg font-medium mb-2">注册功能已关闭</h3>
      <p class="text-muted">管理员已禁止新用户注册，如需账户请联系管理员。</p>
    </div>
    <UButton to="/auth/login" size="lg" class="w-full"> 前往登录 </UButton>
  </div>
</template>
