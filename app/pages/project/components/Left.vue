<script setup lang="ts">
import ModalImportApi from './ModalImportApi.vue';
import type { TreeItem } from '@nuxt/ui';

const props = defineProps<{
  projectId: string;
}>();
const emits = defineEmits<{
  (e: 'select', api: ProjectGetResEndpoint | null): void;
}>();

const endpoints = ref<TreeItem[]>([]);

const searchQuery = ref('');
const filteredEndpoints = computed(() => {
  const v = endpoints.value as TreeItem[];
  if (!searchQuery.value.trim()) {
    return v;
  }

  const query = searchQuery.value.toLowerCase();
  return filterEndpoints(v, query);
});

const filterEndpoints = (endpoints: TreeItem[], query: string): TreeItem[] => {
  if (!query.trim()) return endpoints;

  const lowerQuery = query.toLowerCase();
  const res: TreeItem[] = [];
  for (const item of endpoints) {
    const children = filterEndpoints(item.children || [], query);
    if (item.isFolder && children.length === 0) {
      continue;
    } else if (
      !item.isFolder &&
      !item.label?.toLowerCase().includes(lowerQuery) &&
      !item.path?.toLowerCase().includes(lowerQuery) &&
      !item.method?.toLowerCase().includes(lowerQuery)
    ) {
      continue;
    }

    res.push({
      ...item,
      children,
    });
  }

  return res;
};

const selectApi = (v: TreeItem) => {
  if (!v || v.isFolder) {
    emits('select', null);
  } else {
    emits('select', v as ProjectGetResEndpoint);
  }
};

// 高亮搜索关键词的辅助函数
const getHighlightedText = (text: string, query: string) => {
  if (!query.trim()) return [{ text, highlight: false }];

  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => ({
    text: part,
    highlight: index % 2 === 1 && part.toLowerCase() === query.toLowerCase(),
  }));
};

const overlay = useOverlay();
const modalImportApi = overlay.create(ModalImportApi);
const importApi = async () => {
  const instance = modalImportApi.open({
    projectId: props.projectId,
  });
  if (await instance.result) {
    await loadProject();
  }
};

onMounted(async () => {
  await loadProject();
});

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

const loadProject = async () => {
  const project = await http.get<ProjectGetRes>(`/project/${props.projectId}`);
  const res = project?.endpointGroups.map(convertToTreeItem) ?? [];
  endpoints.value = res;
};
</script>

<template>
  <UCard class="sticky top-18" :ui="{ body: 'p-2 sm:p-2 h-full' }">
    <template #header>
      <div class="flex items-center space-x-2">
        <h2 class="text-lg font-semibold">API</h2>
        <div class="flex-1">
          <UInput
            v-model="searchQuery"
            placeholder="搜索接口名称、路径或方法"
            icon="i-heroicons-magnifying-glass"
            class="w-full"
            size="sm"
            :trailing="false"
          >
            <template v-if="searchQuery" #trailing>
              <UButton icon="i-heroicons-x-mark" size="xs" color="neutral" variant="ghost" @click="searchQuery = ''" />
            </template>
          </UInput>
        </div>
        <div class="flex space-x-2">
          <UButton icon="i-heroicons-plus" size="sm" color="primary" variant="solid" @click="importApi">
            Import
          </UButton>
          <UButton icon="i-heroicons-plus" size="sm" color="primary" variant="solid"> New </UButton>
        </div>
      </div>
    </template>
    <div v-if="searchQuery && filteredEndpoints.length > 0" class="text-xs text-gray-500 mt-1">
      找到 {{ filteredEndpoints.length }} 个结果
    </div>
    <TreeRoot
      v-if="filteredEndpoints.length > 0"
      class="max-h-[calc(100vh-18rem)] overflow-y-auto"
      :get-key="(m) => m.id"
      :items="filteredEndpoints"
      @update:model-value="selectApi"
    >
      <TreeVirtualizer v-slot="{ item }" :estimate-size="28" :text-content="(v) => v.name" :overscan="8">
        <TreeItem :key="item._id" v-bind="item.bind" v-slot="{ isSelected, isExpanded }" class="w-full">
          <div
            class="flex items-center cursor-pointer space-x-2 hover:bg-gray-200 py-0.5 min-w-0"
            :class="{
              'bg-gray-100': isSelected,
            }"
            :style="{ 'padding-left': `${item.level - 0.5}rem` }"
          >
            <template v-if="item.value.isFolder">
              <template v-if="item.hasChildren">
                <UIcon v-if="isExpanded" name="i-heroicons-chevron-down" class="h-4 w-4 text-gray-600" />
                <UIcon v-else name="i-heroicons-chevron-right" class="h-4 w-4 text-gray-600" />
              </template>
              <span :class="{ 'text-primary': isSelected }" class="truncate flex-1 min-w-0" :title="item.value.name">
                <template
                  v-for="(part, partIndex) in getHighlightedText(item.value.name, searchQuery)"
                  :key="partIndex"
                >
                  <mark v-if="part.highlight" class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{{
                    part.text
                  }}</mark>
                  <template v-else>{{ part.text }}</template>
                </template>
              </span>
            </template>
            <template v-else>
              <UBadge :color="getColor(item.value.method)" variant="solid" size="sm" class="w-12 flex justify-center">
                {{ item.value.method.toUpperCase() || 'GET' }}
              </UBadge>
              <span :class="{ 'text-primary': isSelected }" class="truncate flex-1 min-w-0" :title="item.value.name">
                <template
                  v-for="(part, partIndex) in getHighlightedText(item.value.name, searchQuery)"
                  :key="partIndex"
                >
                  <mark v-if="part.highlight" class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{{
                    part.text
                  }}</mark>
                  <template v-else>{{ part.text }}</template>
                </template>
              </span>
            </template>
          </div>
        </TreeItem>
      </TreeVirtualizer>
    </TreeRoot>

    <div v-else-if="searchQuery && filteredEndpoints.length === 0" class="flex items-center justify-center py-8">
      <div class="text-center">
        <UIcon name="i-heroicons-magnifying-glass" class="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p class="text-sm text-gray-500">没有找到匹配的接口</p>
        <p class="text-xs text-gray-400 mt-1">尝试调整搜索关键词</p>
      </div>
    </div>

    <div v-else-if="endpoints.length === 0" class="flex items-center justify-center py-8">
      <div class="text-center">
        <UIcon name="i-heroicons-document-plus" class="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p class="text-sm text-gray-500">暂无API接口</p>
        <p class="text-xs text-gray-400 mt-1">点击上方"Import"或"New"按钮添加接口</p>
      </div>
    </div>
  </UCard>
</template>
