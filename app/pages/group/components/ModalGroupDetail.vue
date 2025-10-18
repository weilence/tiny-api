<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as v from 'valibot';

interface Props {
  mode?: 'create' | 'edit';
  groupData?: SerializeObject<GroupQueryRes>;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  groupData: undefined,
});

const schema = v.object({
  name: v.pipe(v.string(), v.nonEmpty('Name is required')),
  description: v.optional(v.string()),
});

type Schema = v.InferOutput<typeof schema>;

const state = reactive<Schema>({
  name: props.groupData?.name || '',
  description: props.groupData?.description || '',
});

const emit = defineEmits<{ close: [boolean] }>();

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (props.mode === 'edit' && props.groupData) {
    await http.put(`/api/group/${props.groupData.id}`, event.data);
  } else {
    await http.post('/api/group', event.data);
  }

  emit('close', true);
};

const title = computed(() => (props.mode === 'edit' ? 'Edit Group' : 'Create Group'));
const submitText = computed(() => (props.mode === 'edit' ? 'Update' : 'Create'));
</script>

<template>
  <UModal :title="title">
    <template #body>
      <UForm id="create-group-form" :schema="schema" :state="state" @submit="onSubmit">
        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="Enter group name" />
        </UFormField>
        <UFormField label="Description" name="description">
          <UInput v-model="state.description" placeholder="Enter group description" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="button-group">
        <UButton type="submit" form="create-group-form" color="primary">{{ submitText }}</UButton>
        <UButton color="secondary" @click="$emit('close', false)">Cancel</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
