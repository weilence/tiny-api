<script setup lang="ts">

import { TreeOption } from 'naive-ui';
import { computed, ref } from 'vue';
import { useApiStore } from '../stores/api';

const emits = defineEmits<{
    (e: 'select', key: string): void;
}>();

const apiStore = useApiStore()

const data = computed<TreeOption[]>(() => {
    const groups = apiStore.groups;
    const apis = apiStore.apis;
    const groupMap = new Map<number, TreeOption>();
    const apiTree: TreeOption[] = [];

    groups.forEach((group) => {
        const groupNode = {
            label: group.name,
            key: group.id,
            children: [],
            parentId: group.parentId,
            type: 'group',
        } as TreeOption;
        groupMap.set(group.id, groupNode);
    });

    groupMap.forEach((groupNode) => {
        if (groupNode.parentId === 0) {
            apiTree.push(groupNode);
        } else {
            const parentNode = groupMap.get(groupNode.parentId as number);
            if (parentNode) {
                parentNode.children!.push(groupNode);
            }
        }
    });

    apis.forEach((api) => {
        const apiNode = {
            label: api.name,
            key: 'api-' + api.id,
            parentId: api.groupId,
            type: 'api',
            isLeaf: true,
        } as TreeOption;
        const groupNode = groupMap.get(api.groupId);
        if (groupNode) {
            groupNode.children!.push(apiNode);
        }
    });

    return [{
        label: '根节点',
        key: 0,
        children: apiTree,
    }]
});

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
        apiStore.addApiGroup({
            name: '新目录',
            apis: [],
            children: [],
            description: '',
            parentId: currentNode.key as number,
        })
    } else if (key === 'new-api') {
        apiStore.addApi({
            name: '新接口',
            description: '',
            groupId: currentNode.key as number,
            method: 'GET',
            path: '/',
            body: '',
            queryStrings: [],
            headers: [],
            cookies: [],
            params: [],
        })
    } else if (key === 'delete') {
        if (currentNode.type === 'group') {
            apiStore.deleteApiGroup(currentNode.key as number)
        } else {
            apiStore.deleteApi(currentNode.key as number)
        }
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
    <n-tree block-line :data="data" :node-props="nodeProps" />
    <n-dropdown trigger="manual" placement="bottom-start" :show="dropdown.show" :options="dropdown.options"
        :x="dropdown.x" :y="dropdown.y" @clickoutside="dropdown.show = false" @select="dropdownSelect" />
</template>
