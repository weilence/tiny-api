<script setup lang="ts">
import { ModalConfirmDelete } from '#components';
import type { TabsItem } from '@nuxt/ui';
import ModalGroupDetail from './components/ModalGroupDetail.vue';
import ProjectList from './components/ProjectList.vue';
import GroupMembers from './components/GroupMembers.vue';

useHead({
  title: 'Project Management',
});

const { data: groups, refresh: refreshGroups } = useApi('/api/group');
const selectedGroup = ref<string | null>(null);
const selectedTab = ref<string>('project');
const items = [
  {
    label: 'Project',
    icon: 'i-heroicons-folder',
    value: 'project',
    slot: 'project',
  },
  {
    label: 'Member',
    icon: 'i-heroicons-users',
    value: 'member',
    slot: 'member',
  },
] satisfies TabsItem[];

const overlay = useOverlay();

const modalGroupDetail = overlay.create(ModalGroupDetail);
const createGroup = async () => {
  const instance = modalGroupDetail.open();
  if (await instance.result) {
    await refreshGroups();
  }
};

const editGroup = async (group: SerializeObject<GroupQueryRes>) => {
  const instance = modalGroupDetail.open({
    mode: 'edit',
    groupData: group,
  });
  if (await instance.result) {
    await refreshGroups();
  }
};

const toast = useToast();
const confirmDeleteGroup = overlay.create(ModalConfirmDelete);
const deleteGroup = async (groupId: string) => {
  const instance = confirmDeleteGroup.open({
    title: 'Delete Group',
    description: 'Are you sure you want to delete this group? This action cannot be undone.',
    ok: async () => {
      await http.delete(`/api/group/${groupId}`);
      if (selectedGroup.value === groupId) {
        selectedGroup.value = null;
      }
      await refreshGroups();
    },
  });

  if (!(await instance.result)) {
    return;
  }

  toast.add({
    title: 'Group deleted successfully',
    color: 'success',
    duration: 3000,
  });
};

onMounted(async () => {
  await refreshGroups();
});
</script>

<template>
  <div class="grid grid-cols-12 gap-6 min-h-[calc(100vh-var(--ui-header-height)-var(--spacing)*12)]">
    <div class="col-span-4">
      <UCard class="h-full">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Project Group</h2>
            <UButton icon="i-heroicons-plus" size="sm" color="primary" variant="solid" @click="createGroup">
              New Group
            </UButton>
          </div>
        </template>

        <div class="space-y-2">
          <div
            v-for="group in groups"
            :key="group.id"
            class="p-3 rounded-lg cursor-pointer transition-colors duration-200 border hover:bg-muted"
            :class="{
              'border-primary': group.id == selectedGroup,
              'border-transparent': group.id != selectedGroup,
            }"
            @click="selectedGroup = group.id"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <span class="font-medium" :class="group.id == selectedGroup ? 'text-primary' : ''">
                    {{ group.name }}
                  </span>
                  <div v-if="group.id == selectedGroup" class="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                </div>
                <p v-if="group.description" class="text-xs text-muted mt-1 line-clamp-2 break-all">
                  {{ group.description }}
                </p>
              </div>
              <div v-if="group.id == selectedGroup" class="flex items-center space-x-1 ml-2 flex-shrink-0">
                <UButton
                  icon="i-heroicons-pencil-square"
                  size="xs"
                  color="info"
                  variant="ghost"
                  @click.stop="editGroup(group)"
                />
                <UButton
                  icon="i-heroicons-trash"
                  size="xs"
                  color="error"
                  variant="ghost"
                  @click.stop="deleteGroup(group.id)"
                />
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div class="col-span-8">
      <UTabs v-model="selectedTab" :items="items" :unmount-on-hide="false" class="w-full">
        <template #project>
          <ProjectList :group-id="selectedGroup" />
        </template>
        <template #member>
          <GroupMembers :group-id="selectedGroup" />
        </template>
        <template #content>
          <div class="py-16 text-center text-muted">Please select a group first</div>
        </template>
      </UTabs>
    </div>
  </div>
</template>

<style scoped></style>
