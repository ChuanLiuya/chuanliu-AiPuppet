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
  <div class="app-frame" :class="{ immersive: uiStore.immersive }">
    <!-- 沉浸模式：隐藏左侧应用导航 -->
    <AppSidebar v-if="!uiStore.immersive" />
    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-frame {
  display: flex;
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
