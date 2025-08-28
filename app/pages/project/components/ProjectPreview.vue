<script setup lang="ts">
import ParameterTreeTable from './ParameterTreeTable.vue';

defineProps<{
  data: ProjectEndpointGetRes;
}>();
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">基本信息</h3>
      <div class="bg-muted p-4 rounded-lg">
        <p class="text-sm">
          {{ data.description || '暂无描述' }}
        </p>
      </div>
    </div>

    <div v-if="data.queryParams && data.queryParams.length > 0">
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
            <tr v-for="param in data.queryParams" :key="param.key" class="border-b border-accented">
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

    <div v-if="data.headers && data.headers.length > 0">
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
            <tr v-for="header in data.headers" :key="header.key" class="border-b border-accented">
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

    <div v-if="data.body">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">Body</h3>
      <ParameterTreeTable :parameters="data.body" />
    </div>

    <div v-if="data.response">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">返回数据</h3>
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <UBadge :color="data.response.status === 200 ? 'success' : 'error'" variant="solid" size="sm">
            {{ data.response.status }}
          </UBadge>
          <span class="text-sm">OK</span>
        </div>
        <div class="bg-muted p-4 rounded-lg">
          <pre class="text-sm whitespace-pre-wrap">{{ data.response.body }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
