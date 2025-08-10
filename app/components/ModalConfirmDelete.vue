<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  ok: () => Promise<void>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [boolean];
}>();

const loading = ref(false);

const handleConfirm = async () => {
  loading.value = true;

  try {
    await props.ok(); // 调用传入的删除函数
    emit('close', true); // true 表示删除成功，需要刷新数据
  } catch (error) {
    console.error('Delete user error:', error);
    emit('close', false); // false 表示删除失败
  }

  loading.value = false;
};
</script>

<template>
  <UModal :title="title" width="400px">
    <template #body>
      <div class="py-4">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle" size="24" class="text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-highlighted">
              {{ description }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="button-group">
        <UButton color="error" :loading="loading" @click="handleConfirm"> 确认 </UButton>
        <UButton variant="outline" :disabled="loading" @click="() => $emit('close', false)"> 取消 </UButton>
      </div>
    </template>
  </UModal>
</template>
