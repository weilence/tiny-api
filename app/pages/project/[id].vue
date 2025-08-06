<script setup lang="ts">
import ParameterTreeTable from './components/ParameterTreeTable.vue';
import Left from './components/Left.vue';

const route = useRoute();
const apiDetail = ref<ProjectGetResEndpoint>();

const projectId = route.params.id as string;

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

    <div class="flex gap-6">
      <div class="w-full max-w-120 min-w-0 flex-[1_1_33.33%]">
        <Left :project-id="projectId" @select="(e: any) => apiDetail= e" />
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
            <div class="space-y-6">
              <div>
                <h3 class="font-semibold mb-3 pb-2 border-b border-accented">基本信息</h3>
                <div class="bg-muted p-4 rounded-lg">
                  <p class="text-sm">
                    {{ apiDetail.description || '暂无描述' }}
                  </p>
                </div>
              </div>

              <div v-if="apiDetail.queryParams && apiDetail.queryParams.length > 0">
                <h3 class="font-semibold mb-3 pb-2 border-b border-accented">请求参数</h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-muted">
                      <tr>
                        <th class="px-4 py-2 text-left font-medium">参数名称</th>
                        <th class="px-4 py-2 text-left font-medium">类型</th>
                        <th class="px-4 py-2 text-left font-medium">必填</th>
                        <th class="px-4 py-2 text-left font-medium">备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="param in apiDetail.queryParams" :key="param.key" class="border-b border-accented">
                        <td class="px-4 py-2 text-info">{{ param.key }}</td>
                        <td class="px-4 py-2">{{ param.type }}{{ param.isArray ? '[]' : '' }}</td>
                        <td class="px-4 py-2">
                          <UBadge :color="param.enabled ? 'error' : 'neutral'" variant="soft" size="sm">
                            {{ param.enabled ? '必填' : '可选' }}
                          </UBadge>
                        </td>
                        <td class="px-4 py-2">
                          {{ param.description || '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="apiDetail.headers && apiDetail.headers.length > 0">
                <h3 class="font-semibold mb-3 pb-2 border-b border-accented">Headers</h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-muted">
                      <tr>
                        <th class="px-4 py-2 text-left font-medium">参数名称</th>
                        <th class="px-4 py-2 text-left font-medium">示例值</th>
                        <th class="px-4 py-2 text-left font-medium">必填</th>
                        <th class="px-4 py-2 text-left font-medium">备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="header in apiDetail.headers" :key="header.key" class="border-b border-accented">
                        <td class="px-4 py-2 text-info">{{ header.key }}</td>
                        <td class="px-4 py-2">{{ header.value }}</td>
                        <td class="px-4 py-2">
                          <UBadge :color="header.enabled ? 'error' : 'neutral'" variant="soft" size="sm">
                            {{ header.enabled ? '必填' : '可选' }}
                          </UBadge>
                        </td>
                        <td class="px-4 py-2">
                          {{ header.description || '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="apiDetail.body">
                <h3 class="font-semibold mb-3 pb-2 border-b border-accented">Body</h3>
                <ParameterTreeTable :parameters="apiDetail.body" />
              </div>

              <div v-if="apiDetail.response">
                <h3 class="font-semibold mb-3 pb-2 border-b border-accented">返回数据</h3>
                <div class="space-y-3">
                  <div class="flex items-center space-x-2">
                    <UBadge :color="apiDetail.response.status === 200 ? 'success' : 'error'" variant="solid" size="sm">
                      {{ apiDetail.response.status }}
                    </UBadge>
                    <span class="text-sm">OK</span>
                  </div>
                  <div class="bg-muted p-4 rounded-lg">
                    <pre class="text-sm whitespace-pre-wrap">{{ apiDetail.response.body }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #edit>
            <div class="space-y-6">
              <div>
                <h3 class="font-semibold mb-3">基本信息</h3>
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
                  <h3 class="font-semibold">Headers</h3>
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
                  <h3 class="font-semibold">查询参数</h3>
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
                <h3 class="font-semibold mb-3">请求体</h3>
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
                <h3 class="font-semibold mb-3">响应结果</h3>
                <div class="space-y-4">
                  <div class="flex items-center space-x-4 mb-4">
                    <UBadge :color="apiDetail.response.status === 200 ? 'success' : 'error'" variant="solid">
                      {{ apiDetail.response.status }}
                    </UBadge>
                    <span class="text-sm text-dimmed">响应时间: 234ms</span>
                    <span class="text-sm text-dimmed">大小: 1.2KB</span>
                  </div>

                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">响应头</label>
                    <div class="bg-muted p-3 rounded-lg">
                      <pre class="text-sm"><code>{{ JSON.stringify(apiDetail.response.headers, null, 2) }}</code></pre>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">响应体</label>
                    <div class="bg-muted p-3 rounded-lg">
                      <pre class="text-sm"><code>{{ apiDetail.response.body }}</code></pre>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-muted">点击"发送请求"按钮查看响应结果</div>
            </div>
          </template>

          <template #mock>
            <div class="space-y-6">
              <div class="text-center py-8 text-muted">高级Mock功能开发中...</div>
            </div>
          </template>
        </UTabs>
      </UCard>

      <div v-else class="min-w-0 flex-[2_1_66.67%]">
        <UCard>
          <div class="flex items-center justify-center min-h-[calc(100vh-14rem)]">
            <div class="text-center">
              <UIcon name="i-heroicons-cursor-arrow-rays" class="mx-auto h-12 w-12 text-muted mb-4" />
              <h3 class="text-lg font-medium mb-2">选择一个接口</h3>
              <p class="text-muted">从左侧列表中选择一个接口来查看详细信息</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
