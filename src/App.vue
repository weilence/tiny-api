<script setup lang="ts">
import ApiTree from './components/ApiTree.vue';
</script>

<template>
  <div class="h-screen">
    <n-layout has-sider class="h-full">
      <n-layout-sider bordered>
        <ApiTree />
      </n-layout-sider>
    </n-layout>
  </div>
</template>

<style scoped></style>
