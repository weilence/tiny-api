<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as v from 'valibot';

interface Props {
  mode: 'create' | 'edit';
  userData?: AdminUserListRes;
}

const props = withDefaults(defineProps<Props>(), {
  userData: undefined,
});

// 表单验证schema
const createSchema = v.object({
  username: v.pipe(v.string(), v.nonEmpty('用户名不能为空')),
  email: v.pipe(v.string(), v.email('请输入有效的邮箱地址')),
  password: passwordSchema,
  name: v.optional(v.string()),
  role: roleSchema,
});

const editSchema = v.object({
  username: v.pipe(v.string(), v.nonEmpty('用户名不能为空')),
  email: v.pipe(v.string(), v.email('请输入有效的邮箱地址')),
  password: v.union([v.literal(''), passwordSchema]),
  name: v.optional(v.string()),
  role: roleSchema,
});

type CreateSchema = v.InferOutput<typeof createSchema>;
type EditSchema = v.InferOutput<typeof editSchema>;

// 角色选项
const roleOptions = [
  { label: '普通用户', value: 'MEMBER' },
  { label: '管理员', value: 'ADMIN' },
];

// 表单状态
const state = reactive<CreateSchema | EditSchema>({
  username: props.userData?.username || '',
  email: props.userData?.email || '',
  password: '',
  name: props.userData?.name || '',
  role: props.userData?.role || 'MEMBER',
});

const emit = defineEmits<{ close: [boolean] }>();
const toast = useToast();
const loading = ref(false);

// 计算属性
const title = computed(() => (props.mode === 'create' ? '创建用户' : '编辑用户'));
const submitText = computed(() => (props.mode === 'create' ? '创建' : '更新'));
const schema = computed(() => (props.mode === 'create' ? createSchema : editSchema));

// 方法
const onSubmit = async (event: FormSubmitEvent<CreateSchema | EditSchema>) => {
  loading.value = true;

  try {
    if (props.mode === 'create') {
      await http.post('/admin/user', event.data);
      toast.add({
        title: '创建成功',
        description: '用户已创建',
        color: 'success',
      });
    } else {
      await http.put(`/admin/user/${props.userData!.id}`, event.data);
      toast.add({
        title: '更新成功',
        description: '用户信息已更新',
        color: 'success',
      });
    }

    emit('close', true);
  } catch (error: any) {
    console.error('操作失败:', error);
    toast.add({
      title: '操作失败',
      description: error.data?.message || '操作时出现错误',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  emit('close', false);
};
</script>

<template>
  <UModal :title="title" width="500px">
    <template #body>
      <UForm id="user-form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="用户名" name="username" required>
          <UInput v-model="state.username" placeholder="请输入用户名" icon="i-heroicons-user" />
        </UFormField>

        <UFormField label="邮箱" name="email" required>
          <UInput v-model="state.email" type="email" placeholder="请输入邮箱地址" icon="i-heroicons-envelope" />
        </UFormField>

        <UFormField label="姓名" name="name">
          <UInput v-model="state.name" placeholder="请输入真实姓名（可选）" icon="i-heroicons-identification" />
        </UFormField>

        <UFormField :label="mode === 'create' ? '密码' : '新密码'" name="password" :required="mode === 'create'">
          <UInput
            v-model="state.password"
            type="password"
            :placeholder="mode === 'create' ? '请输入密码' : '留空则不修改密码'"
            icon="i-heroicons-key"
          />
          <template v-if="mode === 'edit'" #help>
            <p class="text-xs text-gray-500 dark:text-gray-400">留空则不修改密码</p>
          </template>
        </UFormField>

        <UFormField label="角色" name="role" required>
          <USelect v-model="state.role" :items="roleOptions" placeholder="请选择用户角色" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="outline" :disabled="loading" @click="handleCancel"> 取消 </UButton>
        <UButton type="submit" form="user-form" color="primary" :loading="loading">
          {{ submitText }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
