<script setup lang="ts">
// 图标来自 Naive UI 配套的 @vicons/ionicons5，由 NIcon 组件渲染
import { h } from 'vue'
import { NIcon, type MenuOption } from 'naive-ui'
import {
  BookOutline,
  ChatbubblesOutline,
  LinkOutline,
  PersonOutline,
  SettingsOutline,
  SparklesOutline,
} from '@vicons/ionicons5'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()


// 当前路由路径，用于高亮选中项
const route = useRoute()
const router = useRouter()

// 导航菜单项：key 即路由路径，icon 用渲染函数返回
const menuOptions: MenuOption[] = [
  { label: '聊天', key: '/chat', icon: () => h(NIcon, null, { default: () => h(ChatbubblesOutline) }) },
  { label: 'API 连接', key: '/api', icon: () => h(NIcon, null, { default: () => h(LinkOutline) }) },
  { label: '角色库', key: '/characters', icon: () => h(NIcon, null, { default: () => h(PersonOutline) }) },
  { label: '世界书', key: '/lorebook', icon: () => h(NIcon, null, { default: () => h(BookOutline) }) },
  { label: '设置', key: '/settings', icon: () => h(NIcon, null, { default: () => h(SettingsOutline) }) },
]

// 当前激活菜单 key：精确匹配，或匹配子路径（如进入 /chat/1 时「聊天」仍高亮）
const activeKey = computed(
  () =>
    menuOptions.find(
      (o) => route.path === o.key || route.path.startsWith(String(o.key)),
    )?.key ?? null,
)

// 点击菜单跳转路由（key 为菜单项的字符串路由路径）
function handleSelect(key: string | number) {
  router.push(String(key))
}
</script>

<template>
  <n-layout-sider
    class="app-sider"
    bordered
    collapse-mode="width"
    :collapsed="uiStore.isSidebarCollapsed"
    :collapsed-width="64"
    :width="200"
    show-trigger="bar"
    @update:collapsed="uiStore.toggleSidebarCollapsed"
  >
    <div class="sider-inner">
      <!-- 顶部 logo -->
      <div class="sider-logo">
        <NIcon :component="SparklesOutline" :size="28" />
        <span v-if="!uiStore.isSidebarCollapsed" class="logo-text">AiPuppet</span>
      </div>

      <!-- 导航菜单 -->
      <n-menu
        class="sider-menu"
        :value="activeKey"
        :options="menuOptions"
        :collapsed="uiStore.isSidebarCollapsed"
        :collapsed-width="64"
        :collapsed-icon-size="20"
        inverted
        @update:value="handleSelect"
      />

      <!-- 底部版本号 -->
      <div v-if="!uiStore.isSidebarCollapsed" class="sider-footer">v0.0.1</div>
    </div>
  </n-layout-sider>
</template>

<style scoped>
.app-sider {
  height: 100%;
  flex-shrink: 0;
}

.sider-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sider-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 56px;
  flex-shrink: 0;
  color: #fff;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}

.sider-menu {
  flex: 1;
}

.sider-footer {
  flex-shrink: 0;
  padding-bottom: 14px;
  text-align: center;
  font-size: 11px;
  color: #6f6f7e;
}
</style>
