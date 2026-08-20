<script setup lang="ts">
// 聊天模块：左侧会话列表 + 右侧聊天区
import SessionPanel from './components/SessionPanel.vue'
import ChatPanel from './components/ChatPanel.vue'
</script>

<template>
  <div class="chat-view">
    <SessionPanel />
    <ChatPanel />
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  height: 100%;
}
</style>
