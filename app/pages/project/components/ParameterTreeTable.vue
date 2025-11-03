<script setup lang="ts">
import { UButton } from '#components';
import type { TableColumn } from '@nuxt/ui';
import type { Parameter } from '~~/shared/types/project';

// 支持 v-model:parameters（由父级统一保存/取消）
const model = defineModel<Parameter[]>('parameters');
const props = defineProps<{
  // 兼容仅查看时直接传入数据
  parameters?: Parameter[];
  // 模式：view | edit（默认 view）
  mode?: 'view' | 'edit';
}>();

const isEdit = computed(() => props.mode === 'edit');


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

// 操作：新增子项 / 删除行
const addChild = (node: Parameter) => {
  if (!isEdit.value) return;
  if (!node.children) node.children = [];
  node.children.push({
    key: 'field',
    type: 'string',
    isArray: false,
    required: false,
    enabled: true,
    value: '',
    description: '',
  } as any);
};

const removeNode = (target: Parameter) => {
  if (!isEdit.value) return;
  const root = (model.value ?? []) as Parameter[];
  const walk = (list: Parameter[]): boolean => {
    const idx = list.indexOf(target);
    if (idx !== -1) {
      list.splice(idx, 1);
      return true;
    }
    for (const item of list) {
      if (item.children && walk(item.children)) return true;
    }
    return false;
  };
  walk(root);
};

// 顶级参数：新增一行（编辑模式）
const addRoot = () => {
  if (!isEdit.value) return;
  const arr = (model.value ?? (model.value = [] as any)) as Parameter[];
  arr.push({
    key: 'field',
    type: 'string',
    isArray: false,
    required: false,
    enabled: true,
    value: '',
    description: '',
  } as any);
};

// 不在表格中处理保存/取消（由父组件统一控制）
</script>

<template>
  <div>
  <!-- 编辑模式工具栏：新增顶级参数 -->
  <div v-if="isEdit" class="mb-2 flex justify-end">
    <UButton icon="i-heroicons-plus" size="xs" color="primary" variant="soft" @click="addRoot"> 新增参数 </UButton>
  </div>
  <UTable
    :data="isEdit ? (model ?? []) : (props.parameters ?? model ?? [])"
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
      <div class="flex items-center gap-1" :style="{ paddingLeft: `${row.depth}rem` }">
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
        <template v-if="isEdit">
          <UInput v-model="row.original.key" size="xs" class="w-40" placeholder="参数名" />
          <UButton
            icon="i-heroicons-plus"
            size="xs"
            color="primary"
            variant="ghost"
            :ui="{ leadingIcon: 'size-4' }"
            @click="addChild(row.original)"
          />
          <UButton
            icon="i-heroicons-trash"
            size="xs"
            color="error"
            variant="ghost"
            :ui="{ leadingIcon: 'size-4' }"
            @click="removeNode(row.original)"
          />
        </template>
        <span v-else class="font-mono text-sm text-info">{{ row.original.key }}</span>
      </div>
    </template>

    <template #type-cell="{ row }">
      <template v-if="isEdit">
        <div class="flex items-center gap-2">
          <UInput v-model="row.original.type" size="xs" class="w-28" placeholder="类型" />
          <USwitch v-model="row.original.isArray" size="xs" />
          <span class="text-xs text-muted">数组</span>
        </div>
      </template>
      <template v-else>
        {{ row.getValue('type') }}
      </template>
    </template>

    <template #required-cell="{ row }">
      <template v-if="isEdit">
        <USwitch v-model="row.original.required" size="xs" />
        <span class="ml-1 text-xs">{{ row.original.required ? '必填' : '可选' }}</span>
        <UBadge v-if="row.original.options" color="primary" variant="soft" size="sm" class="ml-2"> 枚举 </UBadge>
      </template>
      <template v-else>
        <UBadge :color="row.original.required ? 'error' : 'neutral'" variant="soft" size="sm">
          {{ row.original.required ? '必填' : '可选' }}
        </UBadge>
        <UBadge v-if="row.original.options" color="primary" variant="soft" size="sm"> 枚举 </UBadge>
      </template>
    </template>

    <template #value-cell="{ row }">
      <template v-if="isEdit">
        <UInput v-model="row.original.value" size="xs" placeholder="示例值" />
      </template>
      <template v-else>
        {{ row.getValue('value') }}
      </template>
    </template>

    <template #description-cell="{ row }">
      <template v-if="isEdit">
        <div class="space-y-1">
          <UInput
            :model-value="(row.original.options || []).join(', ')"
            size="xs"
            placeholder="枚举值，逗号分隔"
            @update:model-value="(val: string | number | null) => {
              const s = String(val ?? '');
              row.original.options = s
                .split(',')
                .map((m) => m.trim())
                .filter(Boolean);
            }"
          />
          <UTextarea v-model="row.original.description" :rows="2" placeholder="说明" />
        </div>
      </template>
      <span v-else class="text-sm"> {{ row.getValue('description') }} </span>
    </template>
  </UTable>

  </div>
</template>
