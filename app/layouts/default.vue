<template>
  <div class="layout-container">
    <!-- 顶部栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>API Doc</h1>
        </div>
        <nav class="nav">
          <ul class="nav-list">
            <!-- <li><NuxtLink to="/" class="nav-link">首页</NuxtLink></li>
            <li><NuxtLink to="/api" class="nav-link">API</NuxtLink></li>
            <li><NuxtLink to="/docs" class="nav-link">文档</NuxtLink></li> -->
          </ul>
        </nav>
        <div class="user-menu">
          <UserMenu />
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
// 这里可以添加布局相关的逻辑
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部栏样式 */
.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: none;
  margin: 0;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #3b82f6;
}

.nav-link.router-link-active {
  color: #3b82f6;
}

/* 用户菜单样式 */
.user-menu {
  display: flex;
  align-items: center;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 1rem;
    gap: 1rem;
  }

  .nav-list {
    gap: 1rem;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
