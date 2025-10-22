<script setup lang="ts">
import { ModalConfirmDelete } from '#components';
import ModalGroupMemberAdd from './ModalGroupMemberAdd.vue';
const props = defineProps<{ groupId: string | null }>();

const toast = useToast();
const overlay = useOverlay();
const confirmDelete = overlay.create(ModalConfirmDelete);
const modalAdd = overlay.create(ModalGroupMemberAdd);

const roleOptions: { label: string; value: MemberRole }[] = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'DEVELOPER', value: 'DEVELOPER' },
  { label: 'GUEST', value: 'GUEST' },
];

const { data, refresh, pending } = useAsyncData(
  async () => {
    if (!props.groupId) {
      return null;
    }

    const res = await http.get(`/api/group/${props.groupId}/members`);
    return res;
  },
  { watch: [() => props.groupId] }
);
const members = computed(() => data.value?.members || []);
const selfRole = computed(() => data.value?.selfRole || 'GUEST');
const canManage = computed(() => ['ADMIN'].includes(selfRole.value));

const openAdd = async () => {
  if (!props.groupId) {
    toast.add({ title: '请先选择分组', color: 'error' });
    return;
  }
  const ins = modalAdd.open({ groupId: props.groupId });
  if (await ins.result) {
    toast.add({ title: '已添加成员', color: 'success' });
    await refresh();
  }
};

const changeRole = async (userId: string, role: MemberRole) => {
  if (!props.groupId) return;
  await http.put(`/api/group/${props.groupId}/members/${userId}`, { role });
  toast.add({ title: '角色已更新', color: 'success' });
  await refresh();
};

const removeMember = async (userId: string) => {
  if (!props.groupId) return;
  const ins = confirmDelete.open({
    title: '移除成员',
    description: '确定要从分组移除此成员吗？',
    ok: async () => {
      await http.delete(`/api/group/${props.groupId}/members/${userId}`);
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
    <div v-if="!props.groupId" class="py-16 text-center text-muted">请先选择分组</div>
    <div v-else>
      <div v-if="pending" class="py-6 text-center text-muted">加载中...</div>
      <div v-else>
        <div v-if="members.length === 0" class="py-6 text-center text-muted">暂无成员</div>
        <div v-else class="divide-y divide-accented">
          <div v-for="m in members" :key="m.user.id" class="grid grid-cols-12 items-center py-3">
            <div class="col-span-6 flex items-center gap-3 min-w-0">
              <UAvatar :alt="m.user.username" />
              <div class="min-w-0">
                <div class="font-medium truncate">{{ m.user.name || m.user.username }}</div>
                <div class="text-xs text-muted truncate">{{ m.user.email }}</div>
              </div>
            </div>
            <div class="col-span-3">
              <UBadge variant="soft">{{ m.role }}</UBadge>
            </div>
            <div class="col-span-3 text-right">
              <div v-if="canManage" class="flex justify-end gap-2">
                <USelect
                  :model-value="m.role"
                  :items="roleOptions"
                  @update:model-value="(val:any)=>changeRole(m.user.id, val)"
                />
                <UButton icon="i-heroicons-trash" color="error" variant="ghost" @click="removeMember(m.user.id)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped></style>
