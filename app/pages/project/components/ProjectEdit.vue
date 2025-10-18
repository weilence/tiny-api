<script setup lang="ts">
import type { ProjectEndpointGetRes } from '~~/shared/types/project';

const model = defineModel<SerializeObject<ProjectEndpointGetRes>>({ required: true });

const toast = useToast();
const addHeader = () => {
  if (!model.value) {
    toast.add({
      title: 'Please select an API first',
      color: 'error',
      duration: 3000,
    });
    return;
  }

  model.value.headers?.push({
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
  if (!model.value) {
    toast.add({
      title: 'Please select an API first',
      color: 'error',
      duration: 3000,
    });
    return;
  }
  model.value.headers?.splice(index, 1);
};

const addQueryParam = () => {
  if (!model.value) {
    toast.add({
      title: 'Please select an API first',
      color: 'error',
      duration: 3000,
    });
    return;
  }

  model.value.queryParams?.push({
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
  if (!model.value) {
    toast.add({
      title: 'Please select an API first',
      color: 'error',
      duration: 3000,
    });
    return;
  }

  model.value.queryParams?.splice(index, 1);
};
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="font-semibold mb-3">基本信息</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">接口路径</label>
          <UInput v-model="model.path" size="lg" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">接口描述</label>
          <UTextarea v-model="model.description" :rows="3" placeholder="请输入接口描述..." />
        </div>
      </div>
    </div>

    <div>
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-semibold">Headers</h3>
        <UButton icon="i-heroicons-plus" size="sm" variant="soft" @click="addHeader"> 添加 </UButton>
      </div>
      <div class="space-y-2">
        <div v-for="(header, index) in model.headers" :key="index" class="grid grid-cols-12 gap-2 items-center">
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
            <UButton icon="i-heroicons-trash" size="sm" color="error" variant="ghost" @click="removeHeader(index)" />
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
        <div v-for="(param, index) in model.queryParams" :key="index" class="grid grid-cols-12 gap-2 items-center">
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
