<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { useDebounceFn } from '@vueuse/core';
import * as v from 'valibot';

interface Props {
  groupId: string;
}
const props = defineProps<Props>();

// valibot schema (align with Detail modal pattern)
const schema = v.object({
  userId: v.pipe(v.string(), v.nonEmpty('请选择用户')),
  role: v.picklist(['ADMIN', 'DEVELOPER', 'GUEST'] as const),
});
type Schema = v.InferOutput<typeof schema>;

// reactive state
const form = reactive<Schema>({ userId: '', role: 'GUEST' });

// remote search via SelectMenu
const items = ref<UserLite[]>([]);
const selectedItem = ref<UserLite>();
const searching = ref(false);

let controller: AbortController | null = null;
const userSearch = useDebounceFn(async (val: string) => {
  if (controller) {
    controller.abort();
  }

  if (!val) {
    items.value = [];
  } else {
    controller = new AbortController();
    searching.value = true;
    try {
      const res = await http.get<UserLite[]>('/user/search', { query: val, signal: controller.signal });
      items.value = res;
    } finally {
      searching.value = false;
    }
  }

  // keep selected in items
  if (selectedItem.value && !items.value.find((m) => m.id === selectedItem.value!.id)) {
    items.value.unshift(selectedItem.value);
  }
}, 300);

const roleItems: { label: string; value: MemberRole }[] = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'DEVELOPER', value: 'DEVELOPER' },
  { label: 'GUEST', value: 'GUEST' },
];

const emit = defineEmits<{ close: [boolean] }>();

const onSubmit = async (e: FormSubmitEvent<Schema>) => {
  await http.post(`/group/${props.groupId}/members`, e.data);
  emit('close', true);
};
</script>

<template>
  <UModal title="添加成员">
    <template #body>
      <UForm id="add-group-member" :schema="schema" :state="form" @submit="onSubmit">
        <UFormField label="选择用户" name="userId" required>
          <USelectMenu
            v-model="selectedItem"
            :items="items"
            label-key="username"
            :loading="searching"
            ignore-filter
            placeholder="选择用户"
            class="w-full"
            @update:model-value="(value) => (form.userId = value.id)"
            @update:search-term="userSearch"
          />
        </UFormField>

        <UFormField label="角色" name="role" required>
          <USelect
            v-model="form.role"
            :items="roleItems"
            option-attribute="label"
            value-attribute="value"
            class="w-full"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex gap-2 justify-end w-full">
        <UButton color="primary" type="submit" form="add-group-member">确定</UButton>
        <UButton color="neutral" variant="ghost" @click="$emit('close', false)">取消</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
