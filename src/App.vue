<script setup lang="ts">
import { zhCN, dateZhCN, darkTheme } from 'naive-ui'
import AppFrame from './views/layout/AppFrame.vue'
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="darkTheme">
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
  margin: 0;
  padding: 0;
}
</style>
