<script setup lang="ts">
// Naive UI 中文语言包
import { zhCN, dateZhCN } from 'naive-ui'

console.log('electronAPI:', window.electronAPI)
</script>

<template>
  <!-- 全局 Provider：配置主题/语言，并让 Message/Dialog/Notification/LoadingBar 等 API 组件全局可用 -->
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <RouterView />
          </n-notification-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
