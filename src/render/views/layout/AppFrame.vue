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
  <n-layout class="app-frame" has-sider>
    <AppSidebar v-if="!uiStore.immersive" />
    <n-layout-content
      :native-scrollbar="false"
      content-style="height: 100%; width:100%; display: flex; flex-direction: column; overflow: hidden;"
    >
      <RouterView />
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.app-frame {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* n-layout-content 内部容器防止溢出 */
.app-frame :deep(.n-layout-content) {
  min-width: 0;
  overflow: hidden;
}

/* n-layout-sider 防止溢出 */
.app-frame :deep(.n-layout-sider) {
  flex-shrink: 0;
}
</style>
