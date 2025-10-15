<script setup lang="ts">
import { UButton } from '#components';
import type { TableColumn } from '@nuxt/ui';

interface Props {
  parameters: Parameter | Parameter[];
}

const props = defineProps<Props>();

const parameterList = computed(() => {
  if (Array.isArray(props.parameters)) {
    return props.parameters;
  }
  return [props.parameters];
});

const columns: TableColumn<Parameter>[] = [
  {
    id: 'key',
    header: '参数名称',
  },
  {
    id: 'type',
    accessorFn: (param) => (param.isArray ? `${param.type}[]` : param.type),
    header: '类型',
  },
  {
    id: 'required',
    accessorFn: (param) => (param.required ? '必填' : '可选'),
    header: '属性',
  },
  {
    id: 'value',
    accessorFn: (param) => param.value || '-',
    header: '示例值',
  },
  {
    id: 'description',
    header: '说明',
  },
];
</script>

<template>
  <UTable
    :data="parameterList"
    :columns="columns"
    :get-sub-rows="(row) => row.children"
    :ui="{
      base: 'border-separate border-spacing-0',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      tr: 'group',
      td: 'empty:p-0 group-has-[td:not(:empty)]:border-b border-default',
    }"
  >
    <template #key-cell="{ row }">
      <div class="flex gap-1" :style="{ paddingLeft: `${row.depth}rem` }">
        <UButton
          color="neutral"
          variant="outline"
          size="xs"
          :icon="row.getIsExpanded() ? 'i-lucide-minus' : 'i-lucide-plus'"
          :class="!row.getCanExpand() && 'invisible'"
          :ui="{
            base: 'p-0 rounded-sm',
            leadingIcon: 'size-4',
          }"
          @click="row.toggleExpanded()"
        />
        <span class="font-mono text-sm text-info">{{ row.original.key }}</span>
      </div>
    </template>
  </UTable>
</template>
