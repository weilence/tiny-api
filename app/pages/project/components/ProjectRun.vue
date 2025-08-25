<script setup lang="ts">
defineProps<{
  data: ProjectGetResEndpoint;
}>();
</script>

<template>
  <div class="space-y-6">
    <div v-if="data.response">
      <h3 class="font-semibold mb-3">响应结果</h3>
      <div class="space-y-4">
        <div class="flex items-center space-x-4 mb-4">
          <UBadge :color="data.response.status === 200 ? 'success' : 'error'" variant="solid">
            {{ data.response.status }}
          </UBadge>
          <span class="text-sm text-dimmed">响应时间: 234ms</span>
          <span class="text-sm text-dimmed">大小: 1.2KB</span>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">响应头</label>
          <div class="bg-muted p-3 rounded-lg">
            <pre class="text-sm"><code>{{ JSON.stringify(data.response.headers, null, 2) }}</code></pre>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">响应体</label>
          <div class="bg-muted p-3 rounded-lg">
            <pre class="text-sm"><code>{{ data.response.body }}</code></pre>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-muted">点击"发送请求"按钮查看响应结果</div>
  </div>
</template>
