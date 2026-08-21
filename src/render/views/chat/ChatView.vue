<script setup lang="ts">
// 沉浸模式：全局 UI 状态与图标
import { useUiStore } from '@/stores/ui'
import { useThemeVars } from 'naive-ui'
import { ArrowBackOutline, ContractOutline, ExpandOutline } from '@vicons/ionicons5'

const uiStore = useUiStore()
const router = useRouter()
const route = useRoute()
const themeVars = useThemeVars()

// 占位角色信息：根据路由 id 匹配当前聊天的角色（后续替换为真实数据）
const roleMap: Record<number, { name: string; avatar: string }> = {
  1: { name: '苏妲己', avatar: '🦊' },
  2: { name: '林墨', avatar: '🥷' },
  3: { name: 'Alice', avatar: '👩‍🚀' },
}

const currentRole = computed(
  () => roleMap[Number(route.params.id)] ?? { name: '未知角色', avatar: '🤖' },
)

// 占位消息：仅用于查看界面效果，后续替换为真实数据
const messages = [
  { id: 1, role: 'user', content: '你好，能介绍一下你自己吗？' },
  {
    id: 2,
    role: 'assistant',
    content: '当然可以~ 我是这个世界的角色，很高兴认识你。',
    time: '12:31',
  },
  {
    id: 3,
    role: 'assistant',
    content: '既然你来了，我们就开始今天的对话吧。你想聊些什么呢？',
    time: '12:31',
  },
]

// 气泡颜色跟随主题：用户消息用主题色，助手消息用卡片底色
function bubbleStyle(role: string) {
  return role === 'user'
    ? { background: themeVars.value.primaryColor, color: '#fff' }
    : { background: themeVars.value.cardColor, color: themeVars.value.textColor1 }
}
</script>

<template>
  <n-layout class="chat-main">
    <!-- 顶部角色栏（沉浸模式隐藏） -->
    <n-layout-header v-show="!uiStore.immersive" bordered class="chat-header">
      <n-space align="center" :size="12" class="chat-header-left">
        <NButton size="small" secondary title="返回会话列表" @click="router.push('/chat')">
          <template #icon>
            <NIcon :component="ArrowBackOutline" />
          </template>
        </NButton>
        <span class="chat-avatar">{{ currentRole.avatar }}</span>
        <div class="chat-title">
          <div class="chat-name">{{ currentRole.name }}</div>
          <div class="chat-sub">AI 角色扮演 · 在线</div>
        </div>
      </n-space>
      <n-space align="center" :size="8">
        <NButton size="small" secondary>角色信息</NButton>
        <NButton size="small" secondary>参数</NButton>
        <NButton size="small" secondary title="沉浸模式" @click="uiStore.toggleImmersive">
          <template #icon>
            <NIcon :component="ContractOutline" />
          </template>
        </NButton>
      </n-space>
    </n-layout-header>

    <!-- 消息流 -->
    <n-layout-content class="message-list">
      <div v-for="m in messages" :key="m.id" class="message-row" :class="m.role">
        <span v-if="m.role === 'assistant'" class="msg-avatar">{{ currentRole.avatar }}</span>
        <div class="message-bubble" :style="bubbleStyle(m.role)">
          <div v-if="m.role === 'assistant'" class="msg-name">{{ currentRole.name }}</div>
          <div class="msg-content">{{ m.content }}</div>
        </div>
      </div>
    </n-layout-content>

    <!-- 输入区 -->
    <n-layout-footer bordered class="chat-input">
      <NInput type="textarea" :rows="3" placeholder="输入消息，Enter 发送 / Shift+Enter 换行" />
      <n-space justify="end" :size="8" class="input-actions">
        <NButton size="small" secondary disabled>🎲 随机</NButton>
        <NButton type="primary">发送</NButton>
      </n-space>
    </n-layout-footer>

    <!-- 沉浸模式退出按钮 -->
    <Transition name="fade">
      <NButton
        v-if="uiStore.immersive"
        class="exit-immersive"
        round
        secondary
        title="退出沉浸模式 (Esc)"
        @click="uiStore.exitImmersive"
      >
        <template #icon>
          <NIcon :component="ExpandOutline" :size="16" />
        </template>
        退出
      </NButton>
    </Transition>
  </n-layout>
</template>

<style scoped>
/* 右侧聊天区 */
.chat-main {
  flex: 1;
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
}

.chat-header-left {
  display: flex;
  flex: 1;
  min-width: 0;
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
}

.input-actions {
  margin-top: 10px;
}

/* 沉浸模式退出按钮 */
.exit-immersive {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 10;
  opacity: 0.4;
  transition: opacity 0.2s;
}

.exit-immersive:hover {
  opacity: 1;
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
