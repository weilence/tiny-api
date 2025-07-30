<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as v from 'valibot';

interface Props {
  groupId: string;
  mode?: 'create' | 'edit';
  projectData?: ProjectQueryRes;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  projectData: undefined,
});

const schema = v.object({
  name: v.pipe(v.string(), v.nonEmpty('Name is required')),
  description: v.optional(v.string()),
});

type Schema = v.InferOutput<typeof schema>;

const state = reactive<Schema>({
  name: props.projectData?.name || '',
  description: props.projectData?.description || '',
});

const emit = defineEmits<{ close: [boolean] }>();

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (props.mode === 'edit' && props.projectData) {
    await $fetch(`/api/project/${props.projectData.id}`, {
      method: 'PUT',
      body: {
        ...event.data,
        groupId: props.groupId,
      },
    });
  } else {
    await $fetch(`/api/project`, {
      method: 'POST',
      body: {
        ...event.data,
        groupId: props.groupId,
      },
    });
  }

  emit('close', true);
};

const title = computed(() => (props.mode === 'edit' ? 'Edit Project' : 'Create Project'));
const submitText = computed(() => (props.mode === 'edit' ? 'Update' : 'Create'));
</script>

<template>
  <UModal :title="title">
    <template #body>
      <UForm id="create-project-form" :schema="schema" :state="state" @submit="onSubmit">
        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="Enter project name" />
        </UFormField>
        <UFormField label="Description" name="description">
          <UInput v-model="state.description" placeholder="Enter project description" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton class="w-16 flex justify-center" type="submit" form="create-project-form" color="primary">{{
          submitText
        }}</UButton>
        <UButton class="w-16 flex justify-center" color="secondary" @click="$emit('close', false)">Cancel</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
