<template>
  <div>
    <!-- 顶部栏 -->
    <header class="border-b bg-white border-gray-200 shadow-sm sticky top-0 z-50 h-30 flex items-center md:h-16">
      <div class="flex flex-col w-full items-center gap-2 px-4 md:flex-row md:gap-8 md:px-8">
        <div class="logo">
          <h1 class="text-2xl font-bold">API Doc</h1>
        </div>
        <nav class="flex-1">
          <ul class="flex gap-8 md:gap-4">
            <li>
              <NuxtLink to="/group" active-class="text-primary">Project</NuxtLink>
            </li>
            <li><NuxtLink to="/account/profile" active-class="text-primary">Profile</NuxtLink></li>
          </ul>
        </nav>
        <div class="flex items-center">
          <UserMenu />
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="bg-gray-50 min-h-[calc(100vh-(var(--spacing)*30))] p-6 md:min-h-[calc(100vh-(var(--spacing)*16))]">
      <slot />
    </main>
  </div>
</template>

<script setup></script>
