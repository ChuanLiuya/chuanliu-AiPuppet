<script setup lang="ts">
// 图标来自 Naive UI 配套的 @vicons/ionicons5，由 NIcon 组件渲染
import { h, type Component } from 'vue'
import { RouterLink } from 'vue-router'
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

// 导航菜单项：key 即路由路径，icon 用渲染函数返回
const menuOptions: MenuOption[] = [
  { label: renderLabel('/chat', '聊天'), key: '/chat', icon: renderIcon(ChatbubblesOutline) },
  { label: renderLabel('/api', 'API 连接'), key: '/api', icon: renderIcon(LinkOutline) },
  {
    label: renderLabel('/characters', '角色库'),
    key: '/characters',
    icon: renderIcon(PersonOutline),
  },
  { label: renderLabel('/lorebook', '世界书'), key: '/lorebook', icon: renderIcon(BookOutline) },
  { label: renderLabel('/settings', '设置'), key: '/settings', icon: renderIcon(SettingsOutline) },
]

// 菜单文字渲染为 router-link，点击后由 Vue Router 完成路由跳转
function renderLabel(to: string, text: string) {
  return () => h(RouterLink, { to }, { default: () => text })
}

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}
</script>

<template>
  <n-layout-sider
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
        :options="menuOptions"
        :collapsed="uiStore.isSidebarCollapsed"
        :collapsed-width="64"
        :collapsed-icon-size="20"
      />

      <!-- 底部版本号 -->
      <div v-if="!uiStore.isSidebarCollapsed" class="sider-footer">v0.0.1</div>
    </div>
  </n-layout-sider>
</template>

<style scoped>
.sider-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  .sider-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 56px;
    flex-shrink: 0;
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
  }
}
</style>
