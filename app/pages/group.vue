<script setup lang="ts">
import { ModalCreateGroup, ModalCreateProject } from '#components';

const { data: groups } = await useFetch<GroupQueryRes[]>('/api/group');
const projects = ref<ProjectQueryRes[]>([]);

const selectedGroup = ref<string | null>(null);

const selectGroup = async (groupId: string) => {
  selectedGroup.value = groupId;
  const res = await $fetch<ProjectQueryRes[]>(`/api/project`, {
    query: { groupId },
  });
  projects.value = res;
};

const overlay = useOverlay();

const modalCreateGroup = overlay.create(ModalCreateGroup);
const createGroup = async () => {
  const instance = modalCreateGroup.open();
  await instance.result;
};

const toast = useToast();
const modalCreateProject = overlay.create(ModalCreateProject);
const createProject = async () => {
  const groupId = selectedGroup.value;
  if (!groupId) {
    toast.add({
      title: 'Please select a group first',
      color: 'error',
      duration: 3000,
    });
    return;
  }

  const instance = modalCreateProject.open({
    groupId: groupId,
  });
  await instance.result;
};

const navigateToProject = (projectId: string) => {
  navigateTo(`/project/${projectId}`);
};
</script>

<template>
  <div class="p-6">
    <div class="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
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
              class="p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{
                'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800':
                  group.id == selectedGroup,
                'border border-transparent': group.id != selectedGroup,
              }"
              @click="selectGroup(group.id)"
            >
              <div class="flex items-center justify-between">
                <span
                  class="font-medium"
                  :class="group.id == selectedGroup ? 'text-primary-600 dark:text-primary-400' : ''"
                >
                  {{ group.name }}
                </span>
                <div v-if="group.id == selectedGroup" class="w-2 h-2 bg-primary-500 rounded-full" />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <div class="col-span-8">
        <UCard class="h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Project</h2>
              <UButton icon="i-heroicons-plus" size="sm" color="primary" variant="solid" @click="createProject"> New Project </UButton>
            </div>
          </template>

          <div class="grid grid-cols-6 gap-4 p-4">
            <div
              v-for="project in projects"
              :key="project.id"
              class="flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md group"
              @click="navigateToProject(project.id)"
            >
              <h3 class="text-sm font-medium text-center mb-1 line-clamp-2">
                {{ project.name }}
              </h3>

              <p class="text-xs text-gray-500 dark:text-gray-400 text-center line-clamp-1">
                {{ project.description }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
