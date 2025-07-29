<script setup lang="ts">
import ParameterRow from './ParameterRow.vue';

interface Props {
  parameters: Parameter | Parameter[];
}

const props = defineProps<Props>();

// Convert single parameter to array for consistent handling
const parameterList = computed(() => {
  if (Array.isArray(props.parameters)) {
    return props.parameters;
  }
  return [props.parameters];
});

// Function to generate unique node ID
const getNodeId = (param: Parameter, parentPath: string = '') => {
  return parentPath ? `${parentPath}.${param.key}` : param.key;
};
</script>

<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <!-- Table header -->
    <div class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center">
        <div class="py-3 px-4 w-64">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">参数名称</span>
        </div>
        <div class="py-3 px-4 w-32">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">类型</span>
        </div>
        <div class="py-3 px-4 w-20">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">必填</span>
        </div>
        <div class="py-3 px-4 w-40">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">示例值</span>
        </div>
        <div class="py-3 px-4 flex-1 min-w-32">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">说明</span>
        </div>
      </div>
    </div>

    <!-- Table body -->
    <div class="bg-white dark:bg-gray-900">
      <ParameterRow v-for="param in parameterList" :key="getNodeId(param)" :parameter="param" :level="0" />
    </div>
  </div>
</template>
