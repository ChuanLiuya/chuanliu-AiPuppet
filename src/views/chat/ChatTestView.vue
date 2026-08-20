<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { useThemeVars } from 'naive-ui'
import { ArrowBackOutline, ContractOutline } from '@vicons/ionicons5'

const uiStore = useUiStore()
const router = useRouter()
const themeVars = useThemeVars()

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
  <n-layout class="chat-main" content-style="display: flex; flex-direction: column">
    <!-- 顶部标题栏 -->
    <n-layout-header v-show="!uiStore.immersive" bordered class="chat-header">
      <n-space align="center" :size="12" class="chat-header-left">
        <NButton size="small" secondary title="返回会话列表" @click="router.push('/chat')">
          <template #icon>
            <NIcon :component="ArrowBackOutline" />
          </template>
        </NButton>
        <div class="chat-title">
          <div class="chat-name">聊天测试</div>
          <div class="chat-sub">无角色 · 测试模式</div>
        </div>
      </n-space>
      <n-space align="center" :size="8">
        <NButton size="small" secondary title="沉浸模式" @click="uiStore.toggleImmersive">
          <template #icon>
            <NIcon :component="ContractOutline" />
          </template>
        </NButton>
      </n-space>
    </n-layout-header>

    <!-- 消息流 -->
    <n-layout-content
      class="message-list"
      content-style="display: flex; flex-direction: column; gap: 16px; padding: 24px 20px"
    >
      <div v-for="m in messages" :key="m.id" class="message-row" :class="m.role">
        <div class="message-bubble" :style="bubbleStyle(m.role)">
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

  </n-layout>
</template>

<style scoped>
/* 右侧聊天区 */
.chat-main {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;

  /* 顶部标题栏 */
  .chat-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;

    .chat-header-left {
      display: flex;
      flex: 1;
      min-width: 0;

      .chat-title {
        flex: 1;

        .chat-name {
          font-size: 16px;
          font-weight: 600;
        }

        .chat-sub {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  /* 消息流 */
  .message-list {
    flex: 1;

    .message-row {
      display: flex;
      gap: 10px;
      max-width: 78%;

      /* 用户消息靠右，助手消息靠左 */
      &.user {
        align-self: flex-end;
      }

      &.assistant {
        align-self: flex-start;
      }

      .message-bubble {
        padding: 10px 14px;
        border-radius: 12px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

        .msg-content {
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
        }
      }
    }
  }

  /* 输入区 */
  .chat-input {
    flex-shrink: 0;
    padding: 16px 20px;

    .input-actions {
      margin-top: 10px;
    }
  }

}
</style>
