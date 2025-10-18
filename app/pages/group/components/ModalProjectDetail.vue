<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as v from 'valibot';
import { PROJECT_ICONS } from '~~/shared/constants/icons';
import type { ProjectQueryRes } from '~~/shared/types/project';

interface Props {
  groupId: string;
  mode?: 'create' | 'edit';
  projectData?: SerializeObject<ProjectQueryRes>;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  projectData: undefined,
});

const schema = v.object({
  name: v.pipe(v.string(), v.nonEmpty('Name is required')),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
});

type Schema = v.InferOutput<typeof schema>;

const state = reactive<Schema>({
  name: props.projectData?.name || '',
  description: props.projectData?.description || '',
  icon: props.projectData?.icon || '',
});

const emit = defineEmits<{ close: [boolean] }>();

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (props.mode === 'edit' && props.projectData) {
    await http.put(`/api/project/${props.projectData.id}`, {
      ...event.data,
      groupId: props.groupId,
    });
  } else {
    await http.post(`/api/project`, {
      ...event.data,
      groupId: props.groupId,
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

        <UFormField label="Icon" name="icon">
          <USelect
            v-model="state.icon"
            :icon="state.icon"
            :items="PROJECT_ICONS"
            placeholder="Select an icon"
            class="w-40"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="button-group">
        <UButton type="submit" form="create-project-form" color="primary">{{ submitText }}</UButton>
        <UButton color="secondary" @click="$emit('close', false)">Cancel</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
