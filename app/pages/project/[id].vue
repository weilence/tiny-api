<script setup lang="ts">
import ProjectApiTree from './components/ProjectApiTree.vue';
import ProjectMembers from './components/ProjectMembers.vue';
import ProjectApiTable from './components/ProjectApiTable.vue';
import ProjectPreview from './components/ProjectPreview.vue';
import ProjectEdit from './components/ProjectEdit.vue';
import ProjectRun from './components/ProjectRun.vue';
import ProjectMock from './components/ProjectMock.vue';
import type { TreeItem } from '@nuxt/ui';

useHead({
  title: 'Project Detail',
});

const route = useRoute();
const projectId = route.params.id as string;

const treeItems = ref<TreeItem[]>([]);
const loading = ref(true);

const apiDetail = ref<ProjectGetResEndpoint | null>(null);
const apiList = ref<ProjectGetResEndpointGroup[]>([]);

const loadProject = async () => {
  loading.value = true;
  try {
    const res = await http.get<ProjectGetRes>(`/project/${projectId}`);
    treeItems.value = res.endpointGroups.map(convertToTreeItem);
    apiList.value = res.endpointGroups;
    apiDetail.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(loadProject);

// Helpers to transform data for Left tree
const convertToTreeItem = (endpoint: ProjectGetResEndpointGroup): TreeItem => ({
  ...endpoint,
  isFolder: true,
  value: endpoint.id,
  label: endpoint.name,
  children: endpoint.children.map(convertToTreeItem).concat(
    endpoint.endpoints.map((e) => ({
      ...e,
      isFolder: false,
      value: e.id,
      label: e.name,
    }))
  ),
});

const selectedMain = ref('api');
const mainTabs = [
  { label: 'API', value: 'api', slot: 'api' },
  { label: '成员', value: 'members', slot: 'members' },
];

const sendRequest = () => {
  console.log('发送请求:', apiDetail.value);
};

const selectApi = (ep: TreeItem) => {
  if (!ep) {
    apiDetail.value = null;
    apiList.value = treeItems.value as ProjectGetResEndpointGroup[];
  } else if (ep.isFolder) {
    apiDetail.value = null;
    apiList.value = [ep as ProjectGetResEndpointGroup];
  } else {
    apiDetail.value = ep as ProjectGetResEndpoint;
    apiList.value = [];
  }
};
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

    <UTabs v-model="selectedMain" :items="mainTabs" class="w-full">
      <template #api>
        <div class="flex gap-6">
          <div class="w-full max-w-120 min-w-0 flex-[1_1_33.33%]">
            <ProjectApiTree
              :project-id="projectId"
              :items="treeItems"
              :loading="loading"
              @reload="loadProject"
              @select="selectApi"
            />
          </div>

          <UCard v-if="apiDetail" class="min-w-0 flex-[2_1_66.67%]">
            <template #header>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <UBadge :color="getColor(apiDetail.method)" variant="solid" size="sm">
                      {{ apiDetail.method.toUpperCase() }}
                    </UBadge>
                    <h2 class="text-lg font-semibold">{{ apiDetail.name }}</h2>
                  </div>
                  <UButton color="primary" variant="solid" @click="sendRequest">Send Request</UButton>
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
            </template>

            <UTabs
              :items="[
                { slot: 'preview', label: 'Preview' },
                { slot: 'edit', label: 'Edit' },
                { slot: 'run', label: 'Run' },
                { slot: 'mock', label: 'Mock' },
              ]"
              class="mb-6"
            >
              <template #preview>
                <ProjectPreview :data="apiDetail" />
              </template>

              <template #edit>
                <ProjectEdit v-model="apiDetail" />
              </template>

              <template #run>
                <ProjectRun :data="apiDetail" />
              </template>

              <template #mock>
                <ProjectMock />
              </template>
            </UTabs>
          </UCard>
          <div v-else class="min-w-0 flex-[2_1_66.67%]">
            <ProjectApiTable :data="apiList" :loading="loading" @select="selectApi" @reload="loadProject" />
          </div>
        </div>
      </template>
      <template #members>
        <ProjectMembers :project-id="projectId" />
      </template>
    </UTabs>
  </div>
</template>
