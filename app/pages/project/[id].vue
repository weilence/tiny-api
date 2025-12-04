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
const router = useRouter();
const projectId = route.params.id as string;

const treeSelected = ref<{ id: string; name: string; isFolder: boolean }>();
const expandedKeys = ref<string[]>([]);  // 改为数组

const {
  data: projectData,
  pending: loading,
  refresh: refreshApiTree,
} = useApi(`/api/project/${projectId}/api-tree`);
const treeItems = computed(() => projectData.value?.tree || []);
const groupItems = computed(() => projectData.value?.groups || []);

// 找到 endpoint 所在的分组路径（包括所有父节点）
const findEndpointPath = (items: any[], targetId: string, path: string[] = []): string[] | null => {
  for (const item of items) {
    if (item.id === targetId) {
      // 找到目标，返回当前路径（不包括目标本身）
      return path;
    }
    if (item.children && item.children.length > 0) {
      // 递归查找子节点，将当前节点加入路径
      const found = findEndpointPath(item.children, targetId, [...path, item.id]);
      if (found) return found;
    }
  }
  return null;
};

// 从 URL 参数初始化选中的 API
onMounted(() => {
  const endpointId = route.query.endpoint as string;
  const groupId = route.query.group as string;

  if (endpointId) {
    treeSelected.value = { id: endpointId, name: '', isFolder: false };
  } else if (groupId) {
    treeSelected.value = { id: groupId, name: '', isFolder: true };
  }
});

// 当树加载完成且有 endpoint 参数时，展开到对应路径
watch(
  () => projectData.value,
  (data) => {
    const endpointId = route.query.endpoint as string;
    if (data?.tree && endpointId) {
      console.log('Tree data loaded:', data.tree);
      console.log('Looking for endpoint:', endpointId);
      const path = findEndpointPath(data.tree, endpointId);
      console.log('Found path for endpoint:', endpointId, 'Path:', path);
      if (path && path.length > 0) {
        expandedKeys.value = path;  // 直接设置为路径数组
        console.log('Expanded keys set to:', expandedKeys.value);
      } else {
        console.warn('No path found or path is empty');
      }
    }
  },
  { immediate: true }
);

// 监听 treeSelected 变化，更新 URL
watch(treeSelected, (newVal) => {
  if (newVal) {
    const query: Record<string, string> = {};
    if (newVal.isFolder) {
      query.group = newVal.id;
    } else {
      query.endpoint = newVal.id;
    }
    router.replace({ query });
  } else {
    router.replace({ query: {} });
  }
});

// 处理 API 树重新加载
const handleReloadApiTree = async () => {
  const currentEndpoint = treeSelected.value?.isFolder === false ? treeSelected.value.id : undefined;
  await refreshApiTree();
  // 重新加载后，如果之前有选中的 endpoint，保持选中状态并展开路径
  if (currentEndpoint && projectData.value?.tree) {
    treeSelected.value = { id: currentEndpoint, name: '', isFolder: false };
    const path = findEndpointPath(projectData.value.tree, currentEndpoint);
    if (path && path.length > 0) {
      expandedKeys.value = path;  // 直接设置为路径数组
    }
  }
};

const selectedMain = ref('api');
const mainTabs = [
  { label: 'API', value: 'api', slot: 'api' },
  { label: '成员', value: 'members', slot: 'members' },
];

const isEditMode = ref(false);

const {
  data: apiDetail,
  pending: apiDetailPending,
  refresh: refreshApiDetail,
} = useAsyncData(
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

// 保存、取消
const toast = useToast();
const saving = ref(false);
const onCancel = async () => {
  await refreshApiDetail();
  isEditMode.value = false;
};

const onSave = async () => {
  saving.value = true;
  try {
    await http.put(`/api/project/${projectId}/endpoint`, apiDetail.value);
    await refreshApiDetail();
    isEditMode.value = false;
    toast.add({ title: '保存成功', color: 'primary' });
  } catch (e) {
    console.error(e);
    toast.add({ title: '保存失败', color: 'error' });
  } finally {
    saving.value = false;
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

    <UTabs v-model="selectedMain" :items="mainTabs" :unmount-on-hide="false">
      <template #api>
        <div class="flex gap-6">
          <div class="w-full max-w-120 min-w-0 flex-[1_1_33.33%]">
            <ProjectApiTree
              v-model="treeSelected"
              v-model:expanded="expandedKeys"
              :project-id="projectId"
              :items="treeItems"
              :loading="loading"
              @reload="handleReloadApiTree"
            />
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
                    <div v-if="isEditMode" class="flex items-center justify-end gap-2">
                      <UButton color="primary" :loading="saving" @click="onSave">保存</UButton>
                      <UButton color="neutral" variant="soft" @click="onCancel">取消</UButton>
                    </div>
                    <div v-else>
                      <UButton
                        icon="i-heroicons-pencil-square"
                        size="sm"
                        color="info"
                        variant="ghost"
                        @click="isEditMode = true"
                      >
                        Edit
                      </UButton>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium mr-2">Path:</span>
                    <UInput v-if="isEditMode" v-model="apiDetail.path" size="sm" />
                    <span v-else class="text-info">{{ apiDetail.path }}</span>
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
