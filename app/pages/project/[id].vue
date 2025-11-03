<script setup lang="ts">
import ProjectApiTree from './components/ProjectApiTree.vue';
import ProjectMembers from './components/ProjectMembers.vue';
import ProjectApiTable from './components/ProjectApiTable.vue';
import ProjectContent from './components/ProjectContent.vue';
import ProjectMock from './components/ProjectMock.vue';
import USpin from '~/components/USpin.vue';

useHead({
  title: 'Project Detail',
});

const route = useRoute();
const projectId = route.params.id as string;

const treeSelected = ref<{ id: string; name: string; isFolder: boolean }>();
const { data: projectData, pending: loading, refresh: refreshApiTree } = useApi(`/api/project/${projectId}/api-tree`, {
  onResponse: () => {
    treeSelected.value = undefined;
  },
});
const treeItems = computed(() => projectData.value?.tree || []);
const groupItems = computed(() => projectData.value?.groups || []);

// 处理 API 树重新加载
const handleReloadApiTree = async () => {
  treeSelected.value = undefined;
  await refreshApiTree();
};

const selectedMain = ref('api');
const mainTabs = [
  { label: 'API', value: 'api', slot: 'api' },
  { label: '成员', value: 'members', slot: 'members' },
];

const sendRequest = () => {
  console.log('发送请求:', apiDetail.value);
};

const isEditMode = ref(false);

const { data: apiDetail, pending: apiDetailPending } = useAsyncData(
  async () => {
    if (!treeSelected.value || treeSelected.value.isFolder) {
      return undefined;
    }

    const res = await http.get(`/api/project/${projectId}/endpoint`, {
      endpointId: treeSelected.value?.id,
    });
    return res;
  },
  { watch: [treeSelected] }
);
</script>

<template>
  <div>
    <div class="mb-2">
      <nav class="flex items-center space-x-2 text-sm">
        <NuxtLink to="/group" class="text-primary"> Group </NuxtLink>
        <span>/</span>
        <span>Project {{ projectId }}</span>
      </nav>
    </div>

    <UTabs v-model="selectedMain" :items="mainTabs" :unmount-on-hide="false">
      <template #api>
        <div class="flex gap-6">
          <div class="w-full max-w-120 min-w-0 flex-[1_1_33.33%]">
            <ProjectApiTree v-model="treeSelected" :project-id="projectId" :items="treeItems" :loading="loading" @reload="handleReloadApiTree" />
          </div>

          <USpin
            v-if="treeSelected && !treeSelected.isFolder"
            :spinning="apiDetailPending"
            size="large"
            class="min-w-0 flex-[2_1_66.67%]"
          >
            <UCard v-if="apiDetail" class="min-w-0 flex-[2_1_66.67%]">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <UBadge :color="getColor(apiDetail.method)" variant="solid" size="sm">
                      {{ apiDetail.method.toUpperCase() }}
                    </UBadge>
                    <h2 class="text-lg font-semibold">{{ apiDetail.name }}</h2>
                  </div>
                  <div class="flex items-center space-x-3">
                    <USwitch v-model="isEditMode" />
                    <span class="text-sm text-muted">{{ isEditMode ? '编辑模式' : '预览模式' }}</span>
                    <UButton color="primary" variant="solid" @click="sendRequest">Send Request</UButton>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium mr-2">Path:</span>
                    <span class="text-info">{{ apiDetail.path }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="font-medium mr-2">Creator:</span>
                    <UAvatar size="2xs" src="https://avatars.githubusercontent.com/u/1" />
                    <span>admin</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium mr-2">Status:</span>
                    <UBadge color="success" variant="soft" size="sm">Published</UBadge>
                  </div>
                  <div>
                    <span class="font-medium mr-2">Updated At:</span>
                    <span>{{ apiDetail.updatedAt }}</span>
                  </div>
                </div>

                <div v-if="apiDetail.tags && apiDetail.tags.length > 0">
                  <span class="text-sm font-medium mr-2">Tag:</span>
                  <div class="inline-flex flex-wrap gap-1">
                    <UBadge v-for="tag in apiDetail.tags" :key="tag" variant="soft" color="primary" size="sm">
                      {{ tag }}
                    </UBadge>
                  </div>
                </div>
              </div>

              <UTabs
                :items="[
                  { slot: 'content', label: 'Content' },
                  { slot: 'mock', label: 'Mock' },
                ]"
                class="mb-6"
                :unmount-on-hide="false"
              >
                <template #content>
                  <ProjectContent v-model="apiDetail" :edit="isEditMode" />
                </template>

                <template #mock>
                  <ProjectMock />
                </template>
              </UTabs>
            </UCard>
          </USpin>
          <div v-else class="min-w-0 flex-[2_1_66.67%]">
            <ProjectApiTable
              :project-id="projectId"
              :group-id="treeSelected?.id"
              :group-items="groupItems"
              @select="treeSelected = { id: $event.id, name: $event.name, isFolder: false }"
            />
          </div>
        </div>
      </template>
      <template #members>
        <ProjectMembers :project-id="projectId" />
      </template>
    </UTabs>
  </div>
</template>
