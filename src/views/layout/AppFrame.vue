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
    <n-layout-content>
      <RouterView />
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.app-frame {
  height: 100vh;
  overflow: hidden;
}


</style>
