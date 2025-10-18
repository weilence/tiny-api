<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as v from 'valibot';

const schema = v.pipe(
  v.object({
    oldPassword: v.pipe(v.string(), v.nonEmpty('请输入当前密码')),
    newPassword: passwordSchema,
    confirmPassword: v.pipe(v.string(), v.nonEmpty('请确认新密码')),
  }),
  v.forward(
    v.check(({ newPassword, confirmPassword }) => newPassword === confirmPassword, '两次输入的密码不一致'),
    ['confirmPassword']
  )
);

type Schema = v.InferOutput<typeof schema>;

const state = reactive<Schema>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const emit = defineEmits<{ close: [boolean] }>();
const toast = useToast();

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    await http.put('/api/user/password', {
      oldPassword: event.data.oldPassword,
      newPassword: event.data.newPassword,
    });

    toast.add({
      title: '密码修改成功',
      description: '您的密码已成功更新',
      color: 'success',
    });

    emit('close', true);
  } catch (error: any) {
    toast.add({
      title: '密码修改失败',
      description: error.data?.message || '修改密码时出现错误',
      color: 'error',
    });
  }
};

const handleCancel = () => {
  // 清空表单
  state.oldPassword = '';
  state.newPassword = '';
  state.confirmPassword = '';
  emit('close', false);
};
</script>

<template>
  <UModal title="修改密码" width="400px">
    <template #body>
      <UForm id="change-password-form" :schema="schema" :state="state" @submit="onSubmit">
        <div class="space-y-4">
          <UFormField label="当前密码" name="oldPassword" required>
            <UInput
              v-model="state.oldPassword"
              type="password"
              placeholder="请输入当前密码"
              autocomplete="current-password"
            />
          </UFormField>

          <UFormField label="新密码" name="newPassword" required>
            <UInput
              v-model="state.newPassword"
              type="password"
              placeholder="请输入新密码"
              autocomplete="new-password"
            />
          </UFormField>

          <UFormField label="确认新密码" name="confirmPassword" required>
            <UInput
              v-model="state.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              autocomplete="new-password"
            />
          </UFormField>
        </div>
      </UForm>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="outline" @click="handleCancel"> 取消 </UButton>
        <UButton type="submit" form="change-password-form" color="primary"> 确认修改 </UButton>
      </div>
    </template>
  </UModal>
</template>
