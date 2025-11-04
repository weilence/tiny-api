<script setup lang="ts">
import ParameterTreeTable from './ParameterTreeTable.vue';
import type { ProjectEndpointGetRes } from '~~/shared/types/project';

// 双向绑定当前 API 详情
const model = defineModel<ProjectEndpointGetRes>({ required: true });

// 是否编辑模式（由父级控制）
const props = defineProps<{ edit?: boolean }>();
const isEdit = computed(() => props.edit === true);

const queryParams = ref(model.value.queryParams);
const headers = ref(model.value.headers);
const body = ref(model.value.body ? [model.value.body] : []);
const selectedResp = ref(model.value.response?.[0]?.status);
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">基本信息</h3>
      <div class="bg-muted p-4 rounded-lg">
        <p class="text-sm">
          {{ model.description || '暂无描述' }}
        </p>
      </div>
    </div>

    <div v-if="queryParams.length > 0 || isEdit">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">请求参数</h3>
      <ParameterTreeTable v-model="queryParams" :mode="isEdit ? 'edit' : 'view'" />
    </div>

    <div v-if="headers.length > 0 || isEdit">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">Headers</h3>
      <ParameterTreeTable v-model="headers" :mode="isEdit ? 'edit' : 'view'" />
    </div>

    <div v-if="body.length > 0 || isEdit">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">Body</h3>
      <ParameterTreeTable v-model="body" :mode="isEdit ? 'edit' : 'view'" />
    </div>

    <div v-if="model.response.length > 0 || isEdit">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">返回数据</h3>
      <UTabs
        v-model="selectedResp"
        :items="model.response.map((r) => ({ label: String(r.status), value: r.status, data: r.body ? [r.body] : [] }))"
        variant="link"
      >
        <template #content="{ item }">
          <ParameterTreeTable v-model="item.data" :mode="isEdit ? 'edit' : 'view'" />
        </template>
      </UTabs>
    </div>
  </div>
</template>
