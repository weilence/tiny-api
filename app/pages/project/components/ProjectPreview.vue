<script setup lang="ts">
import type { ProjectEndpointGetRes } from '~~/shared/types/project';
import ParameterTreeTable from './ParameterTreeTable.vue';

defineProps<{
  data: SerializeObject<ProjectEndpointGetRes>;
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
      <ParameterTreeTable :parameters="data.queryParams ?? []" />
    </div>

    <div v-if="data.headers && data.headers.length > 0">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">Headers</h3>
      <ParameterTreeTable :parameters="data.headers ?? []" />
    </div>

    <div v-if="data.body">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">Body</h3>
      <ParameterTreeTable :parameters="data.body.children ?? []" />
    </div>

    <div v-if="data.response && data.response.length > 0">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">返回数据</h3>
      <UTabs
        :default-value="data.response[0]!.status.toString()"
        :items="
          data.response.map((r) => {
            return { label: r.status.toString(), value: r.status.toString(), slot: r.status.toString() };
          })
        "
      >
        <template v-for="item in data.response" #[item.status.toString()] :key="item.status">
          <ParameterTreeTable :parameters="item.body?.children ?? []" />
        </template>
      </UTabs>
    </div>
  </div>
</template>
