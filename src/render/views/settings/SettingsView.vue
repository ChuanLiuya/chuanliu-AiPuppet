<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <div class="page">
    <n-card title="外观" class="settings-card">
      <div class="setting-row">
        <span class="setting-label theme-text-1">深色模式</span>
        <n-switch :value="uiStore.isDark" @update:value="uiStore.toggleTheme" />
      </div>
      <p class="setting-tip theme-text-3">
        切换后，页面背景、卡片、文字等颜色会跟随 Naive UI 主题自动适配。
      </p>
    </n-card>
  </div>
</template>

<style scoped>
.page {
  height: 100%;
  padding: 16px;
  overflow: auto;
}

.settings-card {
  max-width: 480px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-label {
  font-size: 14px;
}

.setting-tip {
  margin: 12px 0 0;
  font-size: 12px;
}
</style>
