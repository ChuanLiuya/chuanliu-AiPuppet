<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { useThemeVars } from 'naive-ui'
import { ArrowBackOutline, ContractOutline } from '@vicons/ionicons5'
import { AppSettingKey } from '@shared/constants/app_setting'
import type { ChatMessage } from '@shared/types/chat'
import { debugLog } from '@/composables/useDebugLog'

const uiStore = useUiStore()
const router = useRouter()
const themeVars = useThemeVars()
const message = useMessage()

/** 当前选中的 API 配置 ID */
const selectedConfigId = ref<number | null>(null)

/** 消息列表 */
const messages = ref<ChatMessage[]>([])

/** 输入框文本 */
const inputText = ref('')

/** 是否正在等待 AI 回复 */
const isSending = ref(false)

/** 气泡颜色跟随主题：用户消息用主题色，助手消息用卡片底色 */
function bubbleStyle(role: string) {
  return role === 'user'
    ? { background: themeVars.value.primaryColor, color: '#fff' }
    : { background: themeVars.value.cardColor, color: themeVars.value.textColor1 }
}

/** 页面挂载时加载选中的 API 配置 */
onMounted(async () => {
  const res = await window.electronAPI.appSetting.get(AppSettingKey.SELECTED_API_CONFIG_ID)
  debugLog('appSetting.get', res)
  if (res.success && res.result) {
    selectedConfigId.value = Number(res.result)
  }
})

/** 发送消息 */
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isSending.value) return

  if (!selectedConfigId.value) {
    message.warning('请先在 API 连接页面选择一个配置')
    return
  }

  // 加入用户消息
  const userMsg: ChatMessage = { role: 'user', content: text }
  messages.value.push(userMsg)
  inputText.value = ''
  isSending.value = true

  try {
    // IPC 无法克隆 Vue 响应式代理，需转成普通对象
    const plainMessages = JSON.parse(JSON.stringify(messages.value))
    const res = await window.electronAPI.chat.chat({
      api_config_id: selectedConfigId.value,
      messages: plainMessages,
    })
    debugLog('chat.chat', res)
    if (res.success) {
      messages.value.push({ role: 'assistant', content: res.result.content })
    } else {
      message.error(res.message)
      // 回滚用户消息
      messages.value.pop()
    }
  } catch (err) {
    message.error(`发送失败：${err}`)
    messages.value.pop()
  } finally {
    isSending.value = false
  }
}

/** Enter 发送 / Shift+Enter 换行 */
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
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
          <div class="chat-sub">
            {{ selectedConfigId ? '已连接 API · 测试模式' : '未选择 API 配置' }}
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
    <n-layout-content
      class="message-list"
      content-style="display: flex; flex-direction: column; gap: 16px; padding: 24px 20px"
    >
      <div v-for="(m, i) in messages" :key="i" class="message-row" :class="m.role">
        <div class="message-bubble" :style="bubbleStyle(m.role)">
          <div class="msg-content">{{ m.content }}</div>
        </div>
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
        <NButton type="primary" :loading="isSending" :disabled="!inputText.trim()" @click="sendMessage">
          {{ isSending ? '生成中…' : '发送' }}
        </NButton>
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
