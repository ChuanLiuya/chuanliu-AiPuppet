<script setup lang="ts">
// 侧边导航项：emoji 图标占位 + 文案 + 路由路径
const navItems = [
  { icon: '💬', label: '聊天', path: '/chat' },
  { icon: '🔌', label: 'API 连接', path: '/api' },
  { icon: '👤', label: '角色库', path: '/characters' },
  { icon: '📖', label: '世界书', path: '/lorebook' },
  { icon: '⚙️', label: '设置', path: '/settings' },
]

// 当前路由路径，用于高亮选中项
const route = useRoute()

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <aside class="app-sidebar">
    <div class="sidebar-logo">🎭</div>
    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
    <div class="sidebar-footer">v0.0.1</div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 76px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  background: linear-gradient(180deg, #23222f 0%, #1b1a26 100%);
  color: #fff;
}

.sidebar-logo {
  font-size: 28px;
  margin-bottom: 24px;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 60px;
  padding: 10px 0;
  border-radius: 10px;
  color: #a6a6b5;
  text-decoration: none;
  font-size: 12px;
  transition: background-color 0.2s, color 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.nav-icon {
  font-size: 20px;
}

.sidebar-footer {
  font-size: 11px;
  color: #6f6f7e;
}
</style>
