<script setup lang="ts">
// Naive UI 中文语言包
import { zhCN, dateZhCN } from 'naive-ui'
import AppFrame from './components/layout/AppFrame.vue'

console.log('electronAPI:', window.electronAPI)
</script>

<template>
  <!-- 全局 Provider：配置主题/语言，并让 Message/Dialog/Notification/LoadingBar 等 API 组件全局可用 -->
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <!-- 应用布局壳：左侧导航 + 页面路由 -->
            <AppFrame />
          </n-notification-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style>
/* 全局基础样式：铺满窗口，清除默认 body 边距 */
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* 各页面公共容器样式（配合各 View 使用） */
.page {
  padding: 24px 28px;
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
}

.page-header p {
  margin: 4px 0 0;
  color: #888;
}

.header-actions {
  display: flex;
  gap: 8px;
}
</style>
