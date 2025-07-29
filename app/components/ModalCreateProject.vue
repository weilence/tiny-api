<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as v from 'valibot';

const props = defineProps({
  groupId: {
    type: String,
    required: true,
  },
});

const schema = v.object({
  name: v.pipe(v.string(), v.nonEmpty('Name is required')),
  description: v.optional(v.string()),
});

type Schema = v.InferOutput<typeof schema>;

const state = reactive<Schema>({
  name: '',
  description: '',
});

const emit = defineEmits<{ close: [] }>();

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  await $fetch(`/api/project`, {
    method: 'POST',
    body: {
      ...event.data,
      groupId: props.groupId,
    },
  });

  emit('close');
};
</script>

<template>
  <UModal title="Create Project">
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
        <UButton class="w-16 flex justify-center" type="submit" form="create-project-form" color="primary">Ok</UButton>
        <UButton class="w-16 flex justify-center" color="secondary" @click="$emit('close')">Cancel</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
