<script setup lang="ts">
import { UButton } from '#components';
import type { TableColumn } from '@nuxt/ui';
import type { Parameter } from '~~/shared/types/project';

const props = defineProps<{
  parameters: Parameter[];
}>();

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
    accessorFn: (param: Parameter) => {
      const text: string[] = [];
      if (param.options) {
        text.push(`枚举值: ${param.options.join(', ')}`);
      }
      if (param.description) {
        text.push(param.description);
      }
      const description = text.length > 0 ? text.join('\b') : '';
      return description;
    },
  },
];
</script>

<template>
  <UTable
    :data="props.parameters"
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
    <template #required-cell="{ row }">
      <UBadge :color="row.original.required ? 'error' : 'neutral'" variant="soft" size="sm">
        {{ row.original.required ? '必填' : '可选' }}
      </UBadge>
      <UBadge v-if="row.original.options" color="primary" variant="soft" size="sm"> 枚举 </UBadge>
    </template>
    <template #description-cell="{ row }">
      <span class="text-sm"> {{ row.getValue('description') }} </span>
    </template>
  </UTable>
</template>
