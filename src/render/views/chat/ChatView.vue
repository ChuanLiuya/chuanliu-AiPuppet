<script setup lang="ts">
// 具体聊天页：加载会话与历史消息，发送消息（由主进程自动持久化）
import type { ChatMessageDTO, ChatSessionDTO } from '@shared/types/chat'
import { resolveCharacterDisplayName } from '@shared/utils/character_card'
import { useUiStore } from '@/stores/ui'
import { debugLog } from '@/composables/useDebugLog'
import { useThemeVars } from 'naive-ui'
import { ArrowBackOutline, ContractOutline, ExpandOutline, SendOutline } from '@vicons/ionicons5'

const uiStore = useUiStore()
const router = useRouter()
const route = useRoute()
const themeVars = useThemeVars()
const message = useMessage()

/** 会话 id（来自路由参数） */
const sessionId = computed(() => Number(route.params.id))
/** 当前会话 */
const session = ref<ChatSessionDTO | null>(null)
/** 消息列表 */
const messages = ref<ChatMessageDTO[]>([])
/** 输入框文本 */
const inputText = ref('')
/** 是否正在加载历史 */
const loading = ref(false)
/** 是否正在等待 AI 回复 */
const isSending = ref(false)
/** 消息滚动容器 */
const listRef = ref<HTMLElement | null>(null)

/** 角色展示名（character_card 可能是角色名，也可能是角色卡地址；会话未加载时给兜底文案） */
const characterName = computed(() => resolveCharacterDisplayName(session.value?.character_card, '角色'))

/** 加载会话信息与历史消息 */
async function loadChat() {
  loading.value = true
  const [sessionRes, messageRes] = await Promise.all([
    window.electronAPI.chatSession.findOneById(sessionId.value),
    window.electronAPI.chatMessage.findAll(sessionId.value),
  ])
  debugLog('chatSession.findOneById', sessionRes)
  debugLog('chatMessage.findAll', messageRes)
  loading.value = false

  if (sessionRes.success && sessionRes.result) session.value = sessionRes.result
  else message.error(sessionRes.message)

  if (messageRes.success) messages.value = messageRes.result
  else message.error(messageRes.message)

}

/** 气泡颜色跟随主题：用户消息用主题色，其余（角色/系统）用卡片底色 */
function bubbleStyle(m: ChatMessageDTO) {
  return m.role === 'user'
    ? { background: themeVars.value.primaryColor, color: '#fff' }
    : { background: themeVars.value.cardColor, color: themeVars.value.textColor1 }
}

/** 发送消息 */
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isSending.value || !session.value) return

  inputText.value = ''
  isSending.value = true

  const res = await window.electronAPI.chat.send({
    session_id: session.value.id,
    content: text,
  })
  debugLog('chat.send', res)
  isSending.value = false

  if (res.result) {
    // 用户消息在调 AI 前就已落库，失败时也会带回来，所以直接入列
    messages.value.push(res.result.user_message)
    if (res.result.assistant_message) messages.value.push(res.result.assistant_message)
    else message.error(res.message)
  } else {
    // 连用户消息都没落库（如未配置 API），把输入还原回输入框
    message.error(res.message)
    inputText.value = text
  }

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
          <div class="chat-name">{{ characterName }}</div>
          <div class="chat-sub" :style="{ color: themeVars.textColor3 }">
            AI 角色扮演 · {{ messages.length }} 条消息
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
        <div v-if="loading" class="list-loading">
          <n-spin size="large" />
        </div>

        <template v-else>
          <div
            v-for="m in messages"
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
                <div v-if="m.role !== 'user'" class="msg-name">{{ m.name || characterName }}</div>
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
        :disabled="isSending"
        @keydown="handleKeydown"
      />
      <n-space justify="end" :size="8" class="input-actions">
        <NButton
          type="primary"
          :loading="isSending"
          :disabled="!inputText.trim() || !session"
          @click="sendMessage"
        >
          <template #icon>
            <NIcon :component="SendOutline" />
          </template>
          {{ isSending ? '生成中…' : '发送' }}
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
