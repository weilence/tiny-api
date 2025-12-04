<script setup lang="ts">
import { UButton } from '#components';
import type { TableColumn } from '@nuxt/ui';
import { useClipboard } from '@vueuse/core';
import type { Parameter } from '~~/shared/types/project';

const model = defineModel<Parameter[]>({
  required: true,
});
const props = defineProps({
  mode: {
    type: String as () => 'view' | 'edit',
    default: 'view',
  },
  hasChildren: {
    type: Boolean,
    default: false,
  },
});

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
    id: 'value',
    accessorFn: (param) => param.value || '-',
    header: '示例值',
  },
  {
    id: 'description',
    header: '说明',
  },
];

// 操作：新增子项 / 删除行
const addChild = (node: Parameter) => {
  if (!node.children) {
    node.children = [];
    expanded.value[node.key] = true;
  }
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

const addSibling = (target: Parameter) => {
  const root = (model.value ?? []) as Parameter[];
  const newParam = {
    key: '',
    value: '',
    type: '',
    isArray: false,
    required: false,
    description: '',
    enabled: false,
    children: [],
  };

  const walk = (list: Parameter[]): boolean => {
    const idx = list.indexOf(target);
    if (idx !== -1) {
      list.splice(idx + 1, 0, newParam);
      return true;
    }
    for (const item of list) {
      if (item.children && walk(item.children)) return true;
    }
    return false;
  };
  walk(root);
};

const removeNode = (target: Parameter) => {
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

const addRoot = () => {
  model.value.push({
    key: '',
    value: '',
    type: '',
    isArray: false,
    required: false,
    description: '',
    enabled: false,
    children: [],
  });
};

const expanded = ref<Record<string, boolean>>({});
const { copy } = useClipboard();
const toast = useToast();
const copyText = (text: string) => {
  copy(text);
  toast.add({
    title: '已复制到剪贴板',
    color: 'success',
  });
};
</script>

<template>
  <div>
    <UTable
      key="key"
      expanded
      :data="model"
      :columns="columns"
      :get-sub-rows="(row) => row.children"
      :ui="{
        base: 'border-separate border-spacing-0',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        tr: 'group',
        td: 'empty:p-0 group-has-[td:not(:empty)]:border-b border-default',
      }"
    >
      <template #empty>
        <div v-if="isEdit" class="py-8 text-center">
          <UButton icon="i-heroicons-plus" color="primary" @click="addRoot">新增参数</UButton>
        </div>
        <div v-else class="py-8 text-center text-muted">暂无数据</div>
      </template>

      <template #key-cell="{ row }">
        <div class="flex items-center gap-1" :style="{ paddingLeft: `${row.depth}rem` }">
          <UButton
            color="neutral"
            variant="outline"
            :icon="row.getIsExpanded() ? 'i-lucide-minus' : 'i-lucide-plus'"
            :class="!row.getCanExpand() && 'invisible'"
            :ui="{
              base: 'p-0 rounded-sm',
              leadingIcon: 'size-4',
            }"
            @click="row.toggleExpanded()"
          />
          <template v-if="isEdit">
            <div class="flex items-center gap-1">
              <UInput v-model="row.original.key" class="w-40" placeholder="参数名" />
              <USwitch v-model="row.original.required" size="xs" />
            </div>
            <UButton
              v-if="expanded"
              icon="i-heroicons-plus-circle"
              color="success"
              variant="ghost"
              :ui="{ leadingIcon: 'size-4' }"
              title="添加相邻节点"
              @click="addSibling(row.original)"
            />
            <UButton
              v-if="expanded"
              icon="i-heroicons-plus"
              color="primary"
              variant="ghost"
              :ui="{ leadingIcon: 'size-4' }"
              title="添加子节点"
              @click="addChild(row.original)"
            />
            <UButton
              v-if="expanded"
              icon="i-heroicons-trash"
              color="error"
              variant="ghost"
              :ui="{ leadingIcon: 'size-4' }"
              title="删除"
              @click="removeNode(row.original)"
            />
          </template>
          <div v-else class="flex items-center gap-1">
            <span class="font-mono text-sm text-info">{{ row.original.key }}</span>
            <span v-if="row.original.required" class="text-error">*</span>
          </div>
        </div>
      </template>

      <template #type-cell="{ row }">
        <template v-if="isEdit">
          <div class="flex items-center gap-2">
            <USelect
              v-model="row.original.type"
              class="w-28"
              placeholder="类型"
              :items="['integer', 'number', 'string', 'boolean', 'object']"
            />
            <USwitch v-model="row.original.isArray" size="xs" />
            <span class="text-xs text-muted">数组</span>
          </div>
        </template>
        <template v-else>
          {{ row.original.isArray ? `${row.original.type}[]` : row.original.type }}
        </template>
      </template>

      <template #value-cell="{ row }">
        <template v-if="isEdit">
          <UInput v-model="row.original.value" placeholder="示例值" />
        </template>
        <template v-else>
          {{ row.original.value }}
        </template>
      </template>

      <template #description-cell="{ row }">
        <template v-if="isEdit">
          <div class="flex flex-col space-y-2">
            <UInputTags v-model="row.original.options" class="w-full" placeholder="枚举值（可选）" />
            <UTextarea v-model="row.original.description" :rows="2" placeholder="说明" />
          </div>
        </template>
        <div v-else class="space-y-1">
          <div v-if="row.original.options && row.original.options.length" class="flex flex-wrap items-center gap-1">
            <span class="text-muted">枚举:</span>
            <UBadge
              v-for="v in row.original.options"
              :key="v"
              variant="outline"
              class="cursor-pointer"
              title="点击复制"
              @click="copyText(v)"
            >
              {{ v }}
            </UBadge>
          </div>
          <span>{{ row.original.description }}</span>
        </div>
      </template>
    </UTable>
  </div>
</template>
