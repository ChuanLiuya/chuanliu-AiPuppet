<script setup lang="ts">
// 具体聊天页：会话与历史消息取自 chat store，发送消息（落库由主进程负责）
import type { ChatHistoryDTO } from '@shared/types/chat'
import { useChatStore } from '@/stores/chat'
import { useUiStore } from '@/stores/ui'
import { useThemeVars } from 'naive-ui'
import { ArrowBackOutline, ContractOutline, ExpandOutline, SendOutline } from '@vicons/ionicons5'

const uiStore = useUiStore()
/** 当前会话与历史消息都由 chat store 持有，页面只负责渲染（统一 chatStore.xxx 访问，不解构） */
const chatStore = useChatStore()
const router = useRouter()
const route = useRoute()
const themeVars = useThemeVars()
const message = useMessage()

/** 会话 id（来自路由参数） */
const sessionId = computed(() => Number(route.params.id))
/** 输入框文本 */
const inputText = ref('')

/** 进入会话：store 里已有该会话的缓存时不会重复请求 */
async function loadChat() {
  const err = await chatStore.enterSession(sessionId.value)
  if (err) message.error(err)
}

/** 气泡颜色跟随主题：用户消息用主题色，其余（角色/系统）用卡片底色 */
function bubbleStyle(m: ChatHistoryDTO) {
  return m.role === 'user'
    ? { background: themeVars.value.primaryColor, color: '#fff' }
    : { background: themeVars.value.cardColor, color: themeVars.value.textColor1 }
}

/** 发送消息（落库与入列都在 store 里做） */
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || chatStore.isWaitingResponse || !chatStore.currentSession) return

  // 先清空输入框，失败时再按结果还原
  inputText.value = ''
  const outcome = await chatStore.sendMessage(text)

  // 连用户消息都没落库（如未配置 API），把输入还原回输入框
  if (!outcome.saved) inputText.value = text
  if (outcome.error) message.error(outcome.error)
}

/** Enter 发送 / Shift+Enter 换行 */
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

onMounted(loadChat)
// 只有路由参数变化时组件会被复用，需要重新加载
watch(sessionId, loadChat)
</script>

<template>
  <n-layout
    class="chat-main"
    :content-style="{display: `flex`, flexDirection: `column`, height: `100vh`}"
    :native-scrollbar="false"
  >
    <!-- 顶部角色栏（沉浸模式隐藏） -->
    <n-layout-header v-show="!uiStore.immersive" bordered class="chat-header">
      <n-space align="center" :size="12" class="chat-header-left">
        <NButton size="small" secondary title="返回会话列表" @click="router.push('/chat')">
          <template #icon>
            <NIcon :component="ArrowBackOutline" />
          </template>
        </NButton>
        <div class="chat-title">
          <div class="chat-name">{{ chatStore.characterName }}</div>
          <div class="chat-sub" :style="{ color: themeVars.textColor3 }">
            AI 角色扮演 · {{ chatStore.messages.length }} 条消息
          </div>
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
    <n-layout-content class="chat-body" :native-scrollbar="false">
      <div ref="listRef" class="message-list">
        <div v-if="chatStore.isLoading" class="list-loading">
          <n-spin size="large" />
        </div>

        <template v-else>
          <div
            v-for="m in chatStore.messages"
            :key="m.id"
            class="message-row"
            :class="m.role"
          >
            <div
              v-if="m.role === 'system'"
              class="system-hint"
              :style="{ background: themeVars.cardColor, color: themeVars.textColor3 }"
            >
              {{ m.content }}
            </div>

            <template v-else>
              <div class="message-bubble" :style="bubbleStyle(m)">
                <div v-if="m.role !== 'user'" class="msg-name">{{ m.name || chatStore.characterName }}</div>
                <div class="msg-content">{{ m.content }}</div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </n-layout-content>

    <!-- 输入区 -->
    <n-layout-footer bordered class="chat-input">
      <NInput
        v-model:value="inputText"
        type="textarea"
        :rows="3"
        placeholder="输入消息，Enter 发送 / Shift+Enter 换行"
        :resizable="false"
        :disabled="chatStore.isWaitingResponse"
        @keydown="handleKeydown"
      />
      <n-space justify="end" :size="8" class="input-actions">
        <NButton
          type="primary"
          :loading="chatStore.isWaitingResponse"
          :disabled="!inputText.trim() || !chatStore.currentSession"
          @click="sendMessage"
        >
          <template #icon>
            <NIcon :component="SendOutline" />
          </template>
          {{ chatStore.isWaitingResponse ? '生成中…' : '发送' }}
        </NButton>
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
/* 右侧聊天区（根节点 n-layout.chat-main，其余规则全部嵌套其内） */
.chat-main {
  /* 顶部角色栏 */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;

    .chat-header-left {
      display: flex;
      flex: 1;
      min-width: 0;
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
    }
  }

  /* 消息区 */
  .chat-body {
    .message-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px 20px;

      .list-loading {
        display: flex;
        justify-content: center;
        padding: 48px 0;
      }

      .message-row {
        display: flex;
        gap: 10px;
        max-width: 78%;

        &.user {
          align-self: flex-end;
        }

        &.assistant {
          align-self: flex-start;
        }

        /* 系统消息居中展示（role === 'system'） */
        &.system {
          align-self: center;
          max-width: 100%;

          .system-hint {
            padding: 4px 12px;
            border-radius: 10px;
            font-size: 12px;
          }
        }

        .message-bubble {
          padding: 10px 14px;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

          .msg-name {
            font-size: 12px;
            opacity: 0.6;
            margin-bottom: 4px;
          }

          .msg-content {
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-break: break-word;
          }
        }
      }
    }
  }

  /* 输入区 */
  .chat-input {
    padding: 16px 20px;

    .input-actions {
      margin-top: 10px;
    }
  }

  /* 沉浸模式退出按钮 */
  .exit-immersive {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 10;
    opacity: 0.4;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
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
