<script setup lang="ts">
import { ModalImportApi, ParameterTreeTable, TreeRoot } from '#components';
import type { TreeItem } from '@nuxt/ui';

const route = useRoute();
const apiDetail = ref<Serialized<ProjectGetResEndpoint> | null>(null);
const endpoints = ref<TreeItem[]>([]);
const searchQuery = ref('');
const filteredEndpoints = computed(() => {
  if (!searchQuery.value.trim()) {
    return endpoints.value;
  }

  const query = searchQuery.value.toLowerCase();
  return filterEndpoints(endpoints.value, query) as TreeItem[];
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

const selectApi = (v: any) => {
  if (!v || v.isFolder) {
    apiDetail.value = null;
  } else {
    apiDetail.value = v;
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

const convertToTreeItem = (endpoint: Serialized<ProjectGetResEndpointGroup>, level: number): TreeItem => ({
  ...endpoint,
  isFolder: true,
  value: endpoint.id,
  label: endpoint.name,
  level,
  children: endpoint.children
    .map((c) => convertToTreeItem(c, level + 1))
    .concat(
      endpoint.endpoints.map((e) => ({
        ...e,
        isFolder: false,
        value: e.id,
        label: e.name,
        level: level + 1,
      }))
    ),
});

const loadProject = async () => {
  const project = await $fetch(`/api/project/${projectId}`);

  endpoints.value = project?.endpointGroups.map((e) => convertToTreeItem(e, 0)) ?? [];
};

const projectId = route.params.id;

const getColor = (method: string) => {
  const colors = {
    get: 'success' as const,
    post: 'primary' as const,
    put: 'warning' as const,
    delete: 'error' as const,
    patch: 'secondary' as const,
  } as const;

  return colors[method.toLowerCase() as keyof typeof colors] || 'neutral';
};

const toast = useToast();
const addHeader = () => {
  if (!apiDetail.value) {
    toast.add({
      title: 'Please select an API first',
      color: 'error',
      duration: 3000,
    });
    return;
  }

  apiDetail.value.headers.push({
    key: '',
    value: '',
    description: '',
    enabled: true,
    type: '',
    required: false,
    isArray: false,
  });
};

const removeHeader = (index: number) => {
  if (!apiDetail.value) {
    toast.add({
      title: 'Please select an API first',
      color: 'error',
      duration: 3000,
    });
    return;
  }
  apiDetail.value.headers.splice(index, 1);
};

const addQueryParam = () => {
  if (!apiDetail.value) {
    toast.add({
      title: 'Please select an API first',
      color: 'error',
      duration: 3000,
    });
    return;
  }

  apiDetail.value.queryParams.push({
    key: '',
    value: '',
    description: '',
    enabled: true,
    type: '',
    required: false,
    isArray: false,
  });
};

const removeQueryParam = (index: number) => {
  if (!apiDetail.value) {
    toast.add({
      title: 'Please select an API first',
      color: 'error',
      duration: 3000,
    });
    return;
  }

  apiDetail.value.queryParams.splice(index, 1);
};

const sendRequest = () => {
  console.log('发送请求:', apiDetail.value);
};

const overlay = useOverlay();
const modalImportApi = overlay.create(ModalImportApi);
const importApi = async () => {
  const instance = modalImportApi.open({
    projectId: projectId as string,
  });
  if (await instance.result) {
    await loadProject();
  }
};

onMounted(async () => {
  await loadProject();
});
</script>

<template>
  <div>
    <div class="mb-2">
      <nav class="flex items-center space-x-2 text-sm">
        <NuxtLink to="/group" class="text-primary-600 hover:text-primary-800"> Group </NuxtLink>
        <span class="text-gray-400">/</span>
        <span class="text-gray-600">Project {{ projectId }}</span>
      </nav>
    </div>

    <div class="flex gap-6">
      <div class="w-full max-w-120 min-w-0 flex-[1_1_33.33%]">
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
                    <UButton
                      icon="i-heroicons-x-mark"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      @click="searchQuery = ''"
                    />
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
            <TreeVirtualizer
              v-slot="{ item }"
              :estimate-size="28"
              :text-content="(item) => item.value.name"
              :overscan="8"
            >
              <TreeItem
                :key="item._id"
                v-bind="item.bind"
                v-slot="{ isSelected, isExpanded }"
                :level="item.value.level"
                :style="{ 'padding-left': `${item.level - 0.5}rem` }"
                class="w-full"
              >
                <div
                  class="flex items-center cursor-pointer space-x-2 hover:bg-gray-200 py-0.5 min-w-0"
                  :class="{
                    'bg-gray-100': isSelected,
                  }"
                >
                  <template v-if="item.value.isFolder">
                    <template v-if="item.hasChildren">
                      <UIcon v-if="isExpanded" name="i-heroicons-chevron-down" class="h-4 w-4 text-gray-600" />
                      <UIcon v-else name="i-heroicons-chevron-right" class="h-4 w-4 text-gray-600" />
                    </template>
                    <span
                      :class="{ 'text-primary': isSelected }"
                      class="truncate flex-1 min-w-0"
                      :title="item.value.name"
                    >
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
                    <UBadge
                      :color="getColor(item.value.method)"
                      variant="solid"
                      size="sm"
                      class="w-12 flex justify-center"
                    >
                      {{ item.value.method.toUpperCase() || 'GET' }}
                    </UBadge>
                    <span
                      :class="{ 'text-primary': isSelected }"
                      class="truncate flex-1 min-w-0"
                      :title="item.value.name"
                    >
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

            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span class="font-medium mr-2">Path:</span>
                <span class="text-blue-600 dark:text-blue-400">{{ apiDetail.path }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-medium mr-2">Creator:</span>
                <UAvatar size="2xs" src="https://avatars.githubusercontent.com/u/1" />
                <span>admin</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
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
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Tag:</span>
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
            <div class="space-y-6">
              <div>
                <h3 class="text-base font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  基本信息
                </h3>
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    {{ apiDetail.description || '暂无描述' }}
                  </p>
                </div>
              </div>

              <div v-if="apiDetail.queryParams && apiDetail.queryParams.length > 0">
                <h3 class="text-base font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  请求参数
                </h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">参数名称</th>
                        <th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">类型</th>
                        <th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">必填</th>
                        <th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="param in apiDetail.queryParams"
                        :key="param.key"
                        class="border-t border-gray-200 dark:border-gray-700"
                      >
                        <td class="px-4 py-2 text-blue-600 dark:text-blue-400">{{ param.key }}</td>
                        <td class="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {{ param.type }}{{ param.isArray ? '[]' : '' }}
                        </td>
                        <td class="px-4 py-2">
                          <UBadge :color="param.enabled ? 'error' : 'neutral'" variant="soft" size="sm">
                            {{ param.enabled ? '必填' : '可选' }}
                          </UBadge>
                        </td>
                        <td class="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {{ param.description || '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="apiDetail.headers && apiDetail.headers.length > 0">
                <h3 class="text-base font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">Headers</h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">参数名称</th>
                        <th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">示例值</th>
                        <th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">必填</th>
                        <th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="header in apiDetail.headers"
                        :key="header.key"
                        class="border-t border-gray-200 dark:border-gray-700"
                      >
                        <td class="px-4 py-2 text-blue-600 dark:text-blue-400">{{ header.key }}</td>
                        <td class="px-4 py-2 text-gray-600 dark:text-gray-400">{{ header.value }}</td>
                        <td class="px-4 py-2">
                          <UBadge :color="header.enabled ? 'error' : 'neutral'" variant="soft" size="sm">
                            {{ header.enabled ? '必填' : '可选' }}
                          </UBadge>
                        </td>
                        <td class="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {{ header.description || '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="apiDetail.body">
                <h3 class="text-base font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">Body</h3>
                <ParameterTreeTable :parameters="apiDetail.body" />
              </div>

              <div v-if="apiDetail.response">
                <h3 class="text-base font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  返回数据
                </h3>
                <div class="space-y-3">
                  <div class="flex items-center space-x-2">
                    <UBadge :color="apiDetail.response.status === 200 ? 'success' : 'error'" variant="solid" size="sm">
                      {{ apiDetail.response.status }}
                    </UBadge>
                    <span class="text-sm text-gray-600 dark:text-gray-400">OK</span>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{
                      apiDetail.response.body
                    }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #edit>
            <div class="space-y-6">
              <div>
                <h3 class="text-base font-semibold mb-3">基本信息</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">接口路径</label>
                    <UInput v-model="apiDetail.path" size="lg" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">接口描述</label>
                    <UTextarea v-model="apiDetail.description" :rows="3" placeholder="请输入接口描述..." />
                  </div>
                </div>
              </div>

              <div>
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-base font-semibold">Headers</h3>
                  <UButton icon="i-heroicons-plus" size="sm" variant="soft" @click="addHeader"> 添加 </UButton>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(header, index) in apiDetail.headers"
                    :key="index"
                    class="grid grid-cols-12 gap-2 items-center"
                  >
                    <div class="col-span-1">
                      <USwitch v-model="header.enabled" />
                    </div>
                    <div class="col-span-3">
                      <UInput v-model="header.key" placeholder="Key" size="sm" />
                    </div>
                    <div class="col-span-3">
                      <UInput v-model="header.value" placeholder="Value" size="sm" />
                    </div>
                    <div class="col-span-4">
                      <UInput v-model="header.description" placeholder="Description" size="sm" />
                    </div>
                    <div class="col-span-1">
                      <UButton
                        icon="i-heroicons-trash"
                        size="sm"
                        color="error"
                        variant="ghost"
                        @click="removeHeader(index)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-base font-semibold">查询参数</h3>
                  <UButton icon="i-heroicons-plus" size="sm" variant="soft" @click="addQueryParam"> 添加 </UButton>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(param, index) in apiDetail.queryParams"
                    :key="index"
                    class="grid grid-cols-12 gap-2 items-center"
                  >
                    <div class="col-span-1">
                      <USwitch v-model="param.enabled" />
                    </div>
                    <div class="col-span-3">
                      <UInput v-model="param.key" placeholder="Key" size="sm" />
                    </div>
                    <div class="col-span-3">
                      <UInput v-model="param.value" placeholder="Value" size="sm" />
                    </div>
                    <div class="col-span-4">
                      <UInput v-model="param.description" placeholder="Description" size="sm" />
                    </div>
                    <div class="col-span-1">
                      <UButton
                        icon="i-heroicons-trash"
                        size="sm"
                        color="error"
                        variant="ghost"
                        @click="removeQueryParam(index)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-base font-semibold mb-3">请求体</h3>
                <!-- <UTextarea
                  v-model="apiDetail.body"
                  :rows="12"
                  placeholder="请输入请求体内容..."
                  class="font-mono text-sm"
                /> -->
              </div>
            </div>
          </template>

          <template #run>
            <div class="space-y-6">
              <div v-if="apiDetail.response">
                <h3 class="text-base font-semibold mb-3">响应结果</h3>
                <div class="space-y-4">
                  <div class="flex items-center space-x-4 mb-4">
                    <UBadge :color="apiDetail.response.status === 200 ? 'success' : 'error'" variant="solid">
                      {{ apiDetail.response.status }}
                    </UBadge>
                    <span class="text-sm text-gray-600">响应时间: 234ms</span>
                    <span class="text-sm text-gray-600">大小: 1.2KB</span>
                  </div>

                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">响应头</label>
                    <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <pre class="text-sm"><code>{{ JSON.stringify(apiDetail.response.headers, null, 2) }}</code></pre>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">响应体</label>
                    <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <pre class="text-sm"><code>{{ apiDetail.response.body }}</code></pre>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">点击"发送请求"按钮查看响应结果</div>
            </div>
          </template>

          <template #mock>
            <div class="space-y-6">
              <div class="text-center py-8 text-gray-500">高级Mock功能开发中...</div>
            </div>
          </template>
        </UTabs>
      </UCard>

      <div v-else class="min-w-0 flex-[2_1_66.67%]">
        <UCard>
          <div class="flex items-center justify-center min-h-[calc(100vh-14rem)]">
            <div class="text-center">
              <UIcon name="i-heroicons-cursor-arrow-rays" class="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">选择一个接口</h3>
              <p class="text-gray-500">从左侧列表中选择一个接口来查看详细信息</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
