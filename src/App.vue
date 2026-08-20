<script setup lang="ts">
import { zhCN, dateZhCN } from 'naive-ui'
import AppFrame from './views/layout/AppFrame.vue'

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
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
