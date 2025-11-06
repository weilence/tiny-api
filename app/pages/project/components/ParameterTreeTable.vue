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
            <UInput v-model="row.original.key" class="w-40" placeholder="参数名" />
            <UButton
              v-if="expanded"
              icon="i-heroicons-plus"
              color="primary"
              variant="ghost"
              :ui="{ leadingIcon: 'size-4' }"
              @click="addChild(row.original)"
            />
            <UButton
              v-if="expanded"
              icon="i-heroicons-trash"
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
            <USelect
              v-model="row.original.type"
              class="w-28"
              placeholder="类型"
              :items="['integer', 'number', 'string', 'boolean', 'object']"
            />
            <USwitch v-model="row.original.isArray" />
            <span class="text-xs text-muted">数组</span>
          </div>
        </template>
        <template v-else>
          {{ row.getValue('type') }}
        </template>
      </template>

      <template #required-cell="{ row }">
        <template v-if="isEdit">
          <div class="flex flex-col gap-2">
            <USwitch v-model="row.original.required" :label="row.original.required ? '必填' : '可选'" />
            <UInputTags v-model="row.original.options" class="w-60">枚举</UInputTags>
          </div>
        </template>
        <template v-else>
          <UBadge :color="row.original.required ? 'error' : 'neutral'" variant="soft">
            {{ row.original.required ? '必填' : '可选' }}
          </UBadge>
          <UPopover v-if="row.original.options && row.original.options.length" mode="hover">
            <UBadge color="primary" variant="soft">枚举</UBadge>
            <template #content>
              <div class="flex flex-wrap gap-1 max-w-xs">
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
            </template>
          </UPopover>
        </template>
      </template>

      <template #value-cell="{ row }">
        <template v-if="isEdit">
          <UInput v-model="row.original.value" placeholder="示例值" />
        </template>
        <template v-else>
          {{ row.getValue('value') }}
        </template>
      </template>

      <template #description-cell="{ row }">
        <template v-if="isEdit">
          <div class="space-y-1">
            <UTextarea v-model="row.original.description" :rows="2" placeholder="说明" />
          </div>
        </template>
        <span v-else class="text-sm"> {{ row.getValue('description') }} </span>
      </template>
    </UTable>
    <UButton v-if="isEdit" icon="i-heroicons-plus" color="primary" block @click="addRoot">新增参数</UButton>
  </div>
</template>
