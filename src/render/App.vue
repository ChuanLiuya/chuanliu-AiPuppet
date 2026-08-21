<script setup lang="ts">
import { zhCN, dateZhCN, darkTheme } from 'naive-ui'
import { useUiStore } from '@/stores/ui'
import AppFrame from '@/views/layout/AppFrame.vue'
const uiStore = useUiStore()
</script>

<template>
  <n-config-provider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="uiStore.isDark ? darkTheme : null"
  >
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-notification-provider>
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
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
