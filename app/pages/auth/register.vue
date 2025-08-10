<script setup lang="ts">
import * as v from 'valibot';
import type { FormSubmitEvent } from '@nuxt/ui';

// 页面元数据
definePageMeta({
  layout: false,
  title: '注册',
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

// 响应式状态
const state = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  //   agreeToTerms: false,
});

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

// 页面标题
useHead({
  title: '注册',
});
</script>

<template>
  <NuxtLayout name="auth">
    <template #header>
      <h2 class="mt-6 text-center text-3xl font-extrabold">
        {{ settings.allowRegister ? '创建新账户' : '注册已禁用' }}
      </h2>
      <p class="mt-2 text-center text-sm">
        <template v-if="settings.allowRegister">
          已有账户？
          <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500"> 立即登录 </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500"> 返回登录 </NuxtLink>
        </template>
      </p>
    </template>

    <template #body>
      <!-- 注册被禁用时显示的提示信息 -->
      <div v-if="!settings.allowRegister" class="text-center space-y-4">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 mx-auto text-warning" />
        <div>
          <h3 class="text-lg font-medium mb-2">注册功能已关闭</h3>
          <p class="text-muted">管理员已禁止新用户注册，如需账户请联系管理员。</p>
        </div>
        <UButton to="/auth/login" size="lg" class="w-full"> 前往登录 </UButton>
      </div>

      <!-- 注册表单 -->
      <UForm v-else :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <UFormField label="邮箱地址" name="email" required>
          <UInput v-model="state.email" type="email" placeholder="请输入邮箱地址" :disabled="loading" class="w-full" />
        </UFormField>

        <UFormField label="用户名" name="username" required>
          <UInput v-model="state.username" type="text" placeholder="请输入用户名" :disabled="loading" class="w-full" />
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

        <!-- <div>
            <UCheckbox v-model="state.agreeToTerms" :disabled="loading" required>
              <template #label>
                我同意
                <NuxtLink to="/terms" class="text-primary-600 hover:text-primary-500"> 服务条款 </NuxtLink>
                和
                <NuxtLink to="/privacy" class="text-primary-600 hover:text-primary-500"> 隐私政策 </NuxtLink>
              </template>
            </UCheckbox>
          </div> -->

        <UButton type="submit" :loading="loading" size="lg" class="w-full"> 创建账户 </UButton>
      </UForm>
    </template>
  </NuxtLayout>
</template>
