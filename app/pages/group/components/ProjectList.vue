<script setup lang="ts">
import { ModalConfirmDelete } from '#components';
import ModalProjectDetail from './ModalProjectDetail.vue';
import type { ProjectQueryRes } from '~~/shared/types/project';

const props = defineProps<{
  groupId: string | null;
}>();

const {
  data: projects,
  refresh: refreshProjects,
  pending,
} = useAsyncData(
  async () => {
    if (!props.groupId) {
      return [];
    }
    const res = await http.get(`/api/project`, {
      groupId: props.groupId,
    });
    return res;
  },
  { watch: [() => props.groupId] },
);

const overlay = useOverlay();
const toast = useToast();
const modalProjectDetail = overlay.create(ModalProjectDetail);
const modalConfirmDelete = overlay.create(ModalConfirmDelete);
const createProject = async () => {
  if (!props.groupId) {
    toast.add({
      title: 'Please select a group first',
      color: 'error',
    });
    return;
  }

  const instance = modalProjectDetail.open({
    groupId: props.groupId,
  });
  if (await instance.result) {
    await refreshProjects();
  }
};

const editProject = async (project: SerializeObject<ProjectQueryRes>) => {
  if (props.groupId === null) {
    toast.add({
      title: 'Please select a group first',
      color: 'error',
    });
    return;
  }

  const instance = modalProjectDetail.open({
    mode: 'edit',
    projectData: project,
    groupId: props.groupId,
  });
  if (await instance.result) {
    await refreshProjects();
  }
};

const deleteProject = async (projectId: string) => {
  if (props.groupId === null) {
    toast.add({
      title: 'Please select a group first',
      color: 'error',
    });
    return;
  }

  const instance = modalConfirmDelete.open({
    title: 'Delete Project',
    description: 'Are you sure you want to delete this project? This action cannot be undone.',
    ok: async () => {
      await http.delete(`/api/project/${projectId}`);

      toast.add({
        title: 'Project deleted successfully',
        color: 'success',
      });
    },
  });
  if (!(await instance.result)) {
    return;
  }

  await refreshProjects();
};

const navigateToProject = (projectId: string) => {
  navigateTo(`/project/${projectId}`);
};
</script>

<template>
  <UCard class="h-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Project</h2>
        <UButton
          v-if="groupId"
          icon="i-heroicons-plus"
          size="sm"
          color="primary"
          variant="solid"
          @click="createProject"
        >
          New Project
        </UButton>
      </div>
    </template>
    <div v-if="pending" class="py-16 text-center text-muted">Loading projects...</div>
    <div v-else class="grid grid-cols-6 gap-4 p-4">
      <div
        v-for="project in projects"
        :key="project.id"
        class="relative flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted hover:shadow-md group"
        @click="navigateToProject(project.id)"
      >
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-1">
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
</template>
