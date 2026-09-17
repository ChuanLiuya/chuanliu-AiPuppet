import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChatHistoryDTO, ChatSessionDTO } from '@shared/types/chat'
import { debugLog } from '@/composables/useDebugLog'
import type { ApiResponse } from '@shared/types/api-response'

/**
 * 一次发送的结果
 *
 * 拆成两个字段是为了让页面能分别决定「要不要还原输入框」和「要不要弹错误」：
 * 用户消息已落库（saved=true）时即使 AI 生成失败也不该把输入还回去。
 */
export interface ChatSendOutcome {
  /** 用户消息是否已落库 */
  saved: boolean
  /** 需要提示的错误信息；null 表示没有错误 */
  error: string | null
}

/**
 * 当前会话状态（临时）
 *
 * 「当前会话 + 它的聊天历史」是跨页面的临时状态：会话列表、聊天页都要读同一份数据，
 * 所以统一放这里，页面只做渲染。列表页已经查过整条会话记录，点进聊天页时通过
 * `setCurrentSession` 直接带过来，聊天页就不用再为拿到会话信息多查一次。
 *
 * 约定：
 * - 数据只从 IPC 来，页面不要再自己维护一份 session / messages
 * - `messages` 只属于 `messagesOwnerId` 那个会话；换会话必须清空，否则会闪出别人的消息
 * - 本 store 不做持久化（关掉应用即丢），落库始终由主进程负责
 */
export const useChatStore = defineStore('chat', () => {
  /** 当前会话；null 表示还没进入任何会话 */
  const currentSession = ref<ChatSessionDTO | null>(null)
  /** 当前会话的聊天历史（按时间升序） */
  const messages = ref<ChatHistoryDTO[]>([])
  /** 是否正在加载会话信息/历史 */
  const isLoading = ref(false)
  /** 是否正在等待 AI 回复 */
  const isWaitingResponse = ref(false)
  /**
   * 清空当前会话及其历史
   *
   * 清除当前会话
   *
   * 清除当前对话的聊天历史
   */
  function clear() {
    currentSession.value = null
    messages.value = []
    isWaitingResponse.value = false
  }

  /**
   * 设置当前会话
   *
   * 会话列表点进来时用
   * 设置当前会话后，会自动清除聊天记录数组
   */
  function setCurrentSession(session: ChatSessionDTO) {
    messages.value = []
    currentSession.value = session
  }

  async function findChatHistoryBySession(session: ChatSessionDTO | null): Promise<ApiResponse<ChatHistoryDTO[]>> {
    if (session === null) return {
      success: false,
      message: `会话ID为空！`
    }
    const res = await window.electronAPI.chatHistory.findAll(session.id)
    debugLog('chatHistory.findAll', res)

    messages.value = res.result ?? []

    return res
  }

  /**
   * 发送一条消息
   *
   * 主进程负责落库与调用 AI，这里只把返回的两条消息按顺序入列，
   * 这样「发送」的唯一数据源就是主进程返回值，前端不自己造数据。
   *
   * @param text 输入框里的原始文本
   */
  async function sendMessage(text: string): Promise<ChatSendOutcome> {
    const content = text.trim()
    const session = currentSession.value

    if (!content) return { saved: false, error: null }
    if (!session) return { saved: false, error: '会话尚未加载完成' }
    if (isWaitingResponse.value) return { saved: false, error: null }

    isWaitingResponse.value = true
    const res = await window.electronAPI.chat.send({ session_id: session.id, content })
    debugLog('chat.send', res)
    isWaitingResponse.value = false

    // 连用户消息都没落库（如未配置 API）：让页面把输入还原回输入框
    if (!res.result) return { saved: false, error: res.message! }

    // 用户消息在调 AI 前就已落库，AI 失败时也会带回来，所以直接入列
    messages.value.push(res.result.user_message)
    if (!res.result.assistant_message) return { saved: true, error: res.message! }

    messages.value.push(res.result.assistant_message)
    return { saved: true, error: null }
  }

  return {
    // 状态
    currentSession,
    messages,
    isLoading,
    isWaitingResponse,
    // 动作
    findChatHistoryBySession,
    clear,
    setCurrentSession,
    sendMessage,
  }
})
