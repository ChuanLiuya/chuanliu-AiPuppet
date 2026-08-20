<script setup lang="ts">
// 沉浸模式：全局 UI 状态与图标
import { useUiStore } from '@/stores/ui'
import { ContractOutline, ExpandOutline } from '@vicons/ionicons5'

// 占位数据：仅用于查看界面效果，后续替换为真实数据
const sessions = [
  { id: 1, name: '苏妲己', avatar: '🦊', lastMessage: '你终于来了~', time: '12:30' },
  { id: 2, name: '林墨', avatar: '🥷', lastMessage: '任务完成，等你指示', time: '昨天' },
  { id: 3, name: 'Alice', avatar: '👩‍🚀', lastMessage: '让我们聊聊宇宙吧', time: '周一' },
]

const messages = [
  { id: 1, role: 'user', content: '你好，能介绍一下你自己吗？' },
  {
    id: 2,
    role: 'assistant',
    name: '苏妲己',
    avatar: '🦊',
    content: '当然可以~ 我是苏妲己，一只修行千年的狐妖。',
    time: '12:31',
  },
  {
    id: 3,
    role: 'assistant',
    name: '苏妲己',
    avatar: '🦊',
    content: '既然你来了，我们就开始今天的对话吧。你想聊些什么呢？',
    time: '12:31',
  },
]

// 沉浸模式状态
const uiStore = useUiStore()
</script>

<template>
  <div class="chat-view">
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

    <!-- 右侧聊天区 -->
    <section class="chat-main">
      <!-- 顶部角色栏（沉浸模式隐藏） -->
      <header v-show="!uiStore.immersive" class="chat-header">
        <span class="chat-avatar">🦊</span>
        <div class="chat-title">
          <div class="chat-name">苏妲己</div>
          <div class="chat-sub">AI 角色扮演 · 在线</div>
        </div>
        <div class="chat-actions">
          <NButton size="small" secondary>角色信息</NButton>
          <NButton size="small" secondary>参数</NButton>
          <NButton size="small" secondary title="沉浸模式" @click="uiStore.toggleImmersive">
            <template #icon>
              <NIcon :component="ContractOutline" />
            </template>
          </NButton>
        </div>
      </header>

      <!-- 消息流 -->
      <div class="message-list">
        <div v-for="m in messages" :key="m.id" class="message-row" :class="m.role">
          <span v-if="m.role === 'assistant'" class="msg-avatar">{{ m.avatar }}</span>
          <div class="message-bubble">
            <div v-if="m.role === 'assistant'" class="msg-name">{{ m.name }}</div>
            <div class="msg-content">{{ m.content }}</div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <footer class="chat-input">
        <NInput type="textarea" :rows="3" placeholder="输入消息，Enter 发送 / Shift+Enter 换行" />
        <div class="input-actions">
          <NButton size="small" secondary disabled>🎲 随机</NButton>
          <NButton type="primary">发送</NButton>
        </div>
      </footer>
    </section>

    <!-- 沉浸模式退出按钮 -->
    <Transition name="fade">
      <button
        v-if="uiStore.immersive"
        class="exit-immersive"
        title="退出沉浸模式 (Esc)"
        @click="uiStore.exitImmersive"
      >
        <NIcon :component="ExpandOutline" :size="16" />
        <span>退出</span>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  height: 100%;
}

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

/* 右侧聊天区 */
.chat-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.chat-avatar {
  font-size: 34px;
}

.chat-title {
  flex: 1;
}

.chat-name {
  font-size: 16px;
  font-weight: 600;
}

.chat-sub {
  font-size: 12px;
  color: #999;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.message-list {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 20px;
}

.message-row {
  display: flex;
  gap: 10px;
  max-width: 78%;
}

.message-row.user {
  align-self: flex-end;
}

.message-row.assistant {
  align-self: flex-start;
}

.msg-avatar {
  font-size: 28px;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-row.user .message-bubble {
  background: #4f6ef2;
  color: #fff;
}

.msg-name {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.msg-content {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 输入区 */
.chat-input {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

/* 沉浸模式退出按钮 */
.exit-immersive {
  position: fixed;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.2s, background-color 0.2s;
}

.exit-immersive:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.55);
}

/* 退出按钮进出场动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
