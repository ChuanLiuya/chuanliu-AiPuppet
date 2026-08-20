<script setup lang="ts">
// 沉浸模式：全局 UI 状态（沉浸时隐藏会话列表）
import { useUiStore } from '@/stores/ui'

// 占位数据：仅用于查看界面效果，后续替换为真实数据
const sessions = [
  { id: 1, name: '苏妲己', avatar: '🦊', lastMessage: '你终于来了~', time: '12:30' },
  { id: 2, name: '林墨', avatar: '🥷', lastMessage: '任务完成，等你指示', time: '昨天' },
  { id: 3, name: 'Alice', avatar: '👩‍🚀', lastMessage: '让我们聊聊宇宙吧', time: '周一' },
]

const uiStore = useUiStore()
</script>

<template>
  <!-- 左侧会话列表（沉浸模式隐藏） -->
  <aside v-show="!uiStore.immersive" class="session-panel">
    <div class="panel-header">
      <span>会话</span>
      <NButton size="small" type="primary" round>＋ 新建</NButton>
    </div>
    <div class="session-list">
      <div
        v-for="s in sessions"
        :key="s.id"
        class="session-item"
        :class="{ active: s.id === 1 }"
      >
        <span class="session-avatar">{{ s.avatar }}</span>
        <div class="session-info">
          <div class="session-name">{{ s.name }}</div>
          <div class="session-preview">{{ s.lastMessage }}</div>
        </div>
        <span class="session-time">{{ s.time }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* 左侧会话列表 */
.session-panel {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
  background: #fff;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
}

.session-list {
  flex: 1;
  overflow: auto;
  padding: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.session-item:hover {
  background: #f5f6fa;
}

.session-item.active {
  background: #eef2ff;
}

.session-avatar {
  font-size: 22px;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name {
  font-size: 14px;
  font-weight: 500;
}

.session-preview {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 11px;
  color: #bbb;
}
</style>
