<script setup lang="ts">
// 具体聊天的界面：从会话列表点进某个会话后展示的全屏聊天
import ChatPanel from './components/ChatPanel.vue'
</script>

<template>
  <div class="chat-view">
    <ChatPanel />
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  height: 100%;
}
</style>
