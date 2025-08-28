<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as v from 'valibot';

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const importTypes = [
  { label: 'URL导入', value: 'url' as const },
  { label: '文件导入', value: 'file' as const },
];

const schema = v.pipe(
  v.object({
    importType: v.picklist(importTypes.map((item) => item.value) as ['url', 'file']),
    url: v.optional(v.string()),
    file: v.optional(v.file()),
  }),
  v.forward(
    v.check(({ importType, url }) => (importType === 'url' ? !!url : true), 'URL is required'),
    ['url']
  ),
  v.forward(
    v.check(({ importType, file }) => (importType === 'file' ? !!file : true), 'File is required'),
    ['file']
  )
);

type Schema = v.InferOutput<typeof schema>;

const state = reactive<Schema>({
  importType: 'url',
  url: '',
  file: undefined,
});

const emit = defineEmits<{ close: [boolean] }>();

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('importType', event.data.importType);
    formData.append('url', event.data.url || '');
    if (event.data.file) {
      formData.append('file', event.data.file);
    }

    await http.post(`/project/${props.projectId}/import`, formData);
    emit('close', true);
  } finally {
    loading.value = false;
  }
};

const loading = ref(false);
</script>

<template>
  <UModal title="Import API" width="600px">
    <template #body>
      <UForm id="import-api-form" :schema="schema" :state="state" @submit="onSubmit">
        <UFormField label="Import Type" name="importType" required>
          <USelect v-model="state.importType" :items="importTypes" />
        </UFormField>

        <UFormField v-if="state.importType === 'url'" label="URL" name="url" required>
          <UInput v-model="state.url" placeholder="Please enter the API document URL" />
        </UFormField>

        <UFormField v-if="state.importType === 'file'" label="File" name="file" required>
          <UFileUpload
            v-model="state.file"
            accept=".json,.yaml,.yml,.txt"
            :multiple="false"
            :max-file-size="10 * 1024 * 1024"
            help="Only supports JSON, YAML, YML, and TXT files. Maximum file size is 10MB."
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="button-group">
        <UButton form="import-api-form" :loading="loading" type="submit">Ok</UButton>
        <UButton color="secondary" @click="$emit('close', false)">Cancel</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
