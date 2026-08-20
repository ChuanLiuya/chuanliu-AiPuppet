<script setup lang="ts">
import AppSidebar from './components/AppSidebar.vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

// 沉浸模式下按 Esc 退出
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && uiStore.immersive) {
    uiStore.exitImmersive()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <n-layout class="app-frame" :class="{ immersive: uiStore.immersive }" has-sider>
    <!-- 沉浸模式：隐藏左侧应用导航（n-layout-sider 必须放在 n-layout 内部） -->
    <AppSidebar v-if="!uiStore.immersive" />
    <n-layout-content class="app-content">
      <RouterView />
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.app-frame {
  height: 100vh;
  overflow: hidden;
}

.app-content {
  flex: 1;
  height: 100%;
  overflow: auto;
  background: #f5f6fa;
}

</style>
