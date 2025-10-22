<script setup lang="ts">
import { ModalConfirmDelete } from '#components';
import ModalProjectMemberAdd from './ModalProjectMemberAdd.vue';

const props = defineProps<{ projectId: string }>();

const { data, pending, refresh } = useApi(() => `/api/project/${props.projectId}/members`, {
  default: () => ({ inherited: [], local: [], selfRole: 'GUEST' }),
});

const canManage = computed(() => ['ADMIN'].includes(data.value?.selfRole ?? 'GUEST'));
const toast = useToast();
const overlay = useOverlay();
const confirmDelete = overlay.create(ModalConfirmDelete);
const modalAdd = overlay.create(ModalProjectMemberAdd);

const roleOptions: { label: string; value: MemberRole }[] = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'DEVELOPER', value: 'DEVELOPER' },
  { label: 'GUEST', value: 'GUEST' },
];

const openAdd = async () => {
  const ins = modalAdd.open({ projectId: props.projectId });
  if (await ins.result) {
    toast.add({ title: '已添加成员', color: 'success' });
    await refresh();
  }
};

const changeRole = async (userId: string, role: MemberRole) => {
  await http.put(`/api/project/${props.projectId}/members/${userId}`, { role });
  toast.add({ title: '角色已更新', color: 'success' });
  await refresh();
};

const removeMember = async (userId: string) => {
  const ins = confirmDelete.open({
    title: '移除成员',
    description: '仅能移除项目本地成员，继承成员请前往分组编辑。',
    ok: async () => {
      await http.delete(`/api/project/${props.projectId}/members/${userId}`);
    },
  });
  if (await ins.result) {
    toast.add({ title: '已移除', color: 'success' });
    await refresh();
  }
};
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">成员</h3>
        <div v-if="canManage">
          <UButton icon="i-heroicons-user-plus" @click="openAdd">添加成员</UButton>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <h4 class="font-semibold">继承自分组</h4>
          <UBadge variant="soft" color="neutral">只读</UBadge>
        </div>
        <div v-if="pending" class="py-4 text-center text-muted">加载中...</div>
        <div v-else class="divide-y divide-accented">
          <div v-for="m in data.inherited" :key="m.user.id" class="grid grid-cols-12 items-center py-3">
            <div class="col-span-6 flex items-center gap-3">
              <UAvatar :alt="m.user.username" />
              <div class="min-w-0">
                <div class="font-medium truncate">{{ m.user.name || m.user.username }}</div>
                <div class="text-xs text-muted truncate">{{ m.user.email }}</div>
              </div>
            </div>
            <div class="col-span-6 text-right">
              <UBadge>{{ m.role }}</UBadge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="flex items-center gap-2 mb-2">
          <h4 class="font-semibold">项目成员</h4>
          <UBadge variant="soft" color="primary">可编辑</UBadge>
        </div>
        <div v-if="pending" class="py-4 text-center text-muted">加载中...</div>
        <div v-else class="divide-y divide-accented">
          <div v-for="m in data.local" :key="m.user.id" class="grid grid-cols-12 items-center py-3">
            <div class="col-span-6 flex items-center gap-3">
              <UAvatar :alt="m.user.username" />
              <div class="min-w-0">
                <div class="font-medium truncate">{{ m.user.name || m.user.username }}</div>
                <div class="text-xs text-muted truncate">{{ m.user.email }}</div>
              </div>
            </div>
            <div class="col-span-6 text-right">
              <div v-if="canManage" class="flex justify-end gap-2">
                <USelect
                  :model-value="m.role"
                  :items="roleOptions"
                  @update:model-value="(val) => changeRole(m.user.id, val)"
                />
                <UButton icon="i-heroicons-trash" color="error" variant="ghost" @click="removeMember(m.user.id)" />
              </div>
              <div v-else>
                <UBadge>{{ m.role }}</UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped></style>
