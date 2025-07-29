<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as v from 'valibot';

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
  await $fetch('/api/group', {
    method: 'POST',
    body: event.data,
  });

  emit('close');
};
</script>

<template>
  <UModal title="Create Modal">
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
        <UButton class="button" type="submit" form="create-group-form" color="primary">Ok</UButton>
        <UButton class="button" color="secondary" @click="$emit('close')">Cancel</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
