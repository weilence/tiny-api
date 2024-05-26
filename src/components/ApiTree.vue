<script setup lang="ts">

import { TreeOption } from 'naive-ui';
import { ref } from 'vue';

const emits = defineEmits<{
    (e: 'select', key: string): void;
}>();

const data = ref<TreeOption[]>([{
    label: '根目录',
    key: 0,
    children: [{
        label: '接口',
        key: 1,
    }],
}]);

const dropdown = ref({
    show: false,
    x: 0,
    y: 0,
    options: [
        { label: '添加子目录', key: 'new-sub' },
        { label: '添加接口', key: 'new-api' },
        { label: '删除', key: 'delete' },
    ],
    treeNode: null as TreeOption | null,
});

function dropdownSelect(key: string): void {
    const currentNode = dropdown.value.treeNode!;
    if (key === 'new-sub') {
        currentNode.children?.push({
            label: '新目录',
            key: Math.random().toString(36).slice(2),
            children: [],
        });
    } else if (key === 'new-api') {
        currentNode.children?.push({
            label: '新接口',
            key: Math.random().toString(36).slice(2),
        });
    } else if (key === 'delete') {
        currentNode.children?.pop();
    }

    dropdown.value.show = false;
}

function nodeProps({ option }: { option: TreeOption }) {
    return {
        onContextmenu(e: MouseEvent): void {
            e.preventDefault();
            dropdown.value.show = true;
            dropdown.value.x = e.clientX;
            dropdown.value.y = e.clientY;
            dropdown.value.treeNode = option;
        }
    }
}

</script>

<template>
    <n-tree block-line :data="data" :default-expanded-keys="[0]" :node-props="nodeProps" />
    <n-dropdown trigger="manual" placement="bottom-start" :show="dropdown.show" :options="dropdown.options"
        :x="dropdown.x" :y="dropdown.y" @clickoutside="dropdown.show = false" @select="dropdownSelect" />
</template>
