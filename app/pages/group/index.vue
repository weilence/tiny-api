<script setup lang="ts">
import ModalGroupDetail from './components/ModalGroupDetail.vue';
import ModalProjectDetail from './components/ModalProjectDetail.vue';

const groups = ref<GroupQueryRes[]>([]);
const projects = ref<ProjectQueryRes[]>([]);
const selectedGroup = ref<string | null>(null);

const loadGroups = async () => {
  const res = await http.get<GroupQueryRes[]>(`/group`);
  groups.value = res;
};

const loadGroup = async (groupId: string) => {
  selectedGroup.value = groupId;
  const res = await http.get<ProjectQueryRes[]>(`/project`, { groupId });
  projects.value = res;
};

const overlay = useOverlay();

const modalGroupDetail = overlay.create(ModalGroupDetail);
const createGroup = async () => {
  const instance = modalGroupDetail.open();
  if (await instance.result) {
    await loadGroups();
  }
};

const editGroup = async (group: GroupQueryRes) => {
  const instance = modalGroupDetail.open({
    mode: 'edit',
    groupData: group,
  });
  if (await instance.result) {
    await loadGroups();
  }
};

const deleteGroup = async (groupId: string) => {
  const confirm = window.confirm('Are you sure you want to delete this group?');
  if (!confirm) return;

  try {
    await http.delete(`/group/${groupId}`);
    toast.add({
      title: 'Group deleted successfully',
      color: 'success',
      duration: 3000,
    });
    if (selectedGroup.value === groupId) {
      selectedGroup.value = null;
      projects.value = [];
    }
    await loadGroups();
  } catch {
    toast.add({
      title: 'Failed to delete group',
      color: 'error',
      duration: 3000,
    });
  }
};

const toast = useToast();
const modalProjectDetail = overlay.create(ModalProjectDetail);
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

  const instance = modalProjectDetail.open({
    groupId: groupId,
  });
  if (await instance.result) {
    await loadGroup(groupId);
  }
};

const editProject = async (project: ProjectQueryRes) => {
  const instance = modalProjectDetail.open({
    mode: 'edit',
    projectData: project,
    groupId: selectedGroup.value!,
  });
  if (await instance.result) {
    await loadGroup(selectedGroup.value!);
  }
};

const deleteProject = async (projectId: string) => {
  const confirm = window.confirm('Are you sure you want to delete this project?');
  if (!confirm) return;

  try {
    await http.delete(`/project/${projectId}`);
    toast.add({
      title: 'Project deleted successfully',
      color: 'success',
      duration: 3000,
    });
    await loadGroup(selectedGroup.value!);
  } catch {
    toast.add({
      title: 'Failed to delete project',
      color: 'error',
      duration: 3000,
    });
  }
};

const navigateToProject = (projectId: string) => {
  navigateTo(`/project/${projectId}`);
};

onMounted(async () => {
  await loadGroups();
});
</script>

<template>
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
            class="p-3 rounded-lg cursor-pointer transition-colors duration-200 border hover:bg-muted"
            :class="{
              'border-primary':
                group.id == selectedGroup,
              'border-transparent': group.id != selectedGroup,
            }"
            @click="loadGroup(group.id)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <span
                    class="font-medium"
                    :class="group.id == selectedGroup ? 'text-primary' : ''"
                  >
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
      <UCard class="h-full">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Project</h2>
            <UButton icon="i-heroicons-plus" size="sm" color="primary" variant="solid" @click="createProject">
              New Project
            </UButton>
          </div>
        </template>

        <div class="grid grid-cols-6 gap-4 p-4">
          <div
            v-for="project in projects"
            :key="project.id"
            class="relative flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted hover:shadow-md group"
            @click="navigateToProject(project.id)"
          >
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <UButton
                icon="i-heroicons-pencil-square"
                size="xs"
                color="info"
                variant="ghost"
                @click.stop="editProject(project)"
              />
              <UButton
                icon="i-heroicons-trash"
                size="xs"
                color="error"
                variant="ghost"
                @click.stop="deleteProject(project.id)"
              />
            </div>

            <!-- Project Icon -->
            <div class="rounded-lg flex items-center justify-center mb-3">
              <UIcon v-if="project.icon" :name="project.icon" :size="64" />
              <UIcon v-else name="i-heroicons-folder" :size="64" />
            </div>

            <h3 class="text-sm font-medium text-center mb-1 line-clamp-1 w-full">
              {{ project.name }}
            </h3>

            <p class="text-xs text-muted text-center line-clamp-2 w-fulll break-all">
              {{ project.description }}
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
</style>
