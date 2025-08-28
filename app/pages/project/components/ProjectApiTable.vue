<script setup lang="tsx">
import type { TableColumn } from '@nuxt/ui';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { UBadge, UButton, USelectMenu } from '#components';

const props = defineProps<{
  data: ProjectApiListGetRes[];
  groupItems: Array<{ id: string; name: string }>;
  loading?: boolean;
}>();
const emit = defineEmits<{ select: [ProjectApiListGetRes] }>();

const statusOptions = [
  { label: '未完成', value: 'pending' },
  { label: '已完成', value: 'done' },
];

// 点击名称，查看详情
const openDetail = (m: ProjectApiListGetRes) => {
  emit('select', m);
};

const columns = ref<TableColumn<ProjectApiListGetRes>[]>([
  {
    id: 'name',
    header: '接口名称',
    meta: {
      class: { th: 'w-[220px]' },
    },
    cell: ({ row }) => (
      <UButton color="primary" variant="link" onClick={() => openDetail(row.original)}>
        {row.original.name || '(未命名)'}
      </UButton>
    ),
  },
  {
    id: 'path',
    header: '接口路径',
    cell: ({ row }) => (
      <div class="gap-2 flex items-center">
        <UBadge
          color={getColor(row.original.method || 'GET')}
          variant="solid"
          size="sm"
          class="w-12 justify-center"
          label={row.original.method?.toUpperCase()}
        />
        <span class="text-info">{row.original.path}</span>
      </div>
    ),
  },
  {
    id: 'groupId',
    header: '接口分类',
    meta: {
      class: { th: 'w-[280px]' },
    },
    cell: ({ row }) => (
      <USelectMenu
        class="w-full"
        modelValue={row.original.groupId || ''}
        onUpdate:modelValue={(e) => (row.original.groupId = e)}
        items={props.groupItems}
        labelKey="name"
        valueKey="id"
      />
    ),
  },
  {
    id: 'status',
    header: '状态',
    meta: {
      class: { th: 'w-[160px]' },
    },
    cell: () => <USelectMenu class="w-full" modelValue={'pending'} items={statusOptions} valueKey="value" />,
  },
  {
    id: 'tags',
    header: 'Tag',
    cell: ({ row }) => (
      <div class="flex flex-wrap gap-1">
        {row.original.tags?.map((tag) => (
          <UBadge variant="soft" color="neutral" size="sm">
            {tag}
          </UBadge>
        ))}
      </div>
    ),
  },
]);

const table = useTemplateRef('table');
const pagination = ref({
  pageIndex: 0,
  pageSize: 13,
});
</script>

<template>
  <UCard :ui="{ body: 'p-0' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold">API 列表</h3>
      </div>
    </template>
    <div class="w-full space-y-4 pb-4">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        :loading="props.loading"
        :data="props.data"
        :columns="columns"
        class="flex-1"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel(),
        }"
      />
      <div class="flex justify-center border-t border-default pt-4">
        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          show-edges
          @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </div>
  </UCard>
</template>
