<script setup lang="ts">
import ModalImportApi from './ModalImportApi.vue';
import type { TreeItem } from '@nuxt/ui';

const props = defineProps<{
  projectId: string;
  items: TreeItem[];
  loading?: boolean;
}>();
const emits = defineEmits<{
  (e: 'reload'): void;
}>();

const modelValue = defineModel<TreeItem>();

const searchQuery = ref('');
const filteredEndpoints = computed(() => {
  const v = (props.items || []) as TreeItem[];
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
    emits('reload');
  }
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
    <div v-if="searchQuery && filteredEndpoints.length > 0" class="text-xs text-muted mt-1">
      找到 {{ filteredEndpoints.length }} 个结果
    </div>
    <UTree
      v-if="filteredEndpoints.length > 0"
      v-model="modelValue"
      label-key="name"
      :get-key="(m) => m.id"
      virtualize
      :items="filteredEndpoints"
      class="max-h-[calc(100vh-var(--ui-header-height)-var(--spacing)*51)] overflow-y-auto"
    >
      <template #item-leading="{ item }">
        <UBadge
          v-if="!item.isFolder"
          :color="getColor(item.method || 'GET')"
          variant="solid"
          size="sm"
          class="w-12 justify-center"
          :label="item.method?.toUpperCase()"
        />
      </template>
      <template #item-label="{ item, selected }">
        <span :class="{ 'text-primary': selected }" class="truncate flex-1 min-w-0" :title="item.name">
          <template v-for="(part, partIndex) in getHighlightedText(item.name, searchQuery)" :key="partIndex">
            <mark v-if="part.highlight" class="rounded px-0.5">{{ part.text }}</mark>
            <template v-else>{{ part.text }}</template>
          </template>
        </span>
      </template>
    </UTree>

    <div v-else-if="searchQuery && filteredEndpoints.length === 0" class="flex items-center justify-center py-8">
      <div class="text-center">
        <UIcon name="i-heroicons-magnifying-glass" class="mx-auto h-8 w-8 mb-2" />
        <p class="text-sm text-dimmed">没有找到匹配的接口</p>
        <p class="text-xs text-toned mt-1">尝试调整搜索关键词</p>
      </div>
    </div>

    <div v-else-if="!props.loading && (props.items?.length || 0) === 0" class="flex items-center justify-center py-8">
      <div class="text-center">
        <UIcon name="i-heroicons-document-plus" class="mx-auto h-8 w-8 mb-2" />
        <p class="text-sm text-dimmed">暂无API接口</p>
        <p class="text-xs text-toned mt-1">点击上方"Import"或"New"按钮添加接口</p>
      </div>
    </div>
  </UCard>
</template>
