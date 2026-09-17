import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChatHistoryDTO, ChatSessionDTO } from '@shared/types/chat'
import { resolveCharacterDisplayName } from '@shared/utils/character_card'
import { debugLog } from '@/composables/useDebugLog'

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
  /** messages 归属的会话 id；null 表示当前没有可用的历史缓存 */
  const messagesOwnerId = ref<number | null>(null)
  /** 是否正在加载会话信息 / 历史 */
  const isLoading = ref(false)
  /** 是否正在等待 AI 回复 */
  const isWaitingResponse = ref(false)

  /** 当前会话 id；没有会话时为 null */
  const sessionId = computed(() => currentSession.value?.id ?? null)

  /** 当前会话的角色展示名（未知时兜底为「角色」） */
  const characterName = computed(() =>
    resolveCharacterDisplayName(currentSession.value?.character_card, '角色'),
  )

  /** 清空当前会话及其历史（删除会话后、或需要彻底复位时调用） */
  function clear() {
    currentSession.value = null
    messages.value = []
    messagesOwnerId.value = null
    isWaitingResponse.value = false
  }

  /**
   * 同步写入当前会话（不请求历史）
   *
   * 会话列表点进来时用：列表已经拿到整条记录，直接交给 store，
   * 聊天页的 `enterSession` 就会跳过 `findOneById`。
   */
  function setCurrentSession(session: ChatSessionDTO) {
    // 换会话了：先丢掉上一个会话的历史，避免进入瞬间渲染出上一个会话的消息
    if (messagesOwnerId.value !== session.id) {
      messages.value = []
      messagesOwnerId.value = null
    }
    currentSession.value = session
  }

  /**
   * 进入会话：保证「会话信息 + 聊天历史」都在 store 里
   *
   * @param target  会话 id，或列表页已有的整条会话记录
   * @param options force=true 时忽略缓存，强制重新拉取历史
   * @returns 出错时的提示信息；null 表示成功
   */
  async function enterSession(
    target: ChatSessionDTO | number,
    options: { force?: boolean } = {},
  ): Promise<string | null> {
    const targetId = typeof target === 'number' ? target : target.id
    if (!Number.isFinite(targetId)) return '无效的会话 id'

    // 整条记录优先（省一次查询）；只有 id 时先清掉上一个会话的残留
    if (typeof target !== 'number') setCurrentSession(target)
    else if (currentSession.value?.id !== targetId) clear()

    // 缓存命中：会话信息和历史都属于这个会话，直接复用
    if (
      !options.force &&
      currentSession.value?.id === targetId &&
      messagesOwnerId.value === targetId
    ) {
      return null
    }

    isLoading.value = true
    let errorMessage: string | null = null

    // 会话信息：只有「手上只有 id」时才需要查
    if (currentSession.value?.id !== targetId) {
      const sessionRes = await window.electronAPI.chatSession.findOneById(targetId)
      debugLog('chatSession.findOneById', sessionRes)
      if (sessionRes.success && sessionRes.result) currentSession.value = sessionRes.result
      else errorMessage = sessionRes.message || '会话不存在'
    }

    if (!errorMessage) {
      const messageRes = await window.electronAPI.chatHistory.findAll(targetId)
      debugLog('chatHistory.findAll', messageRes)
      if (messageRes.success) {
        messages.value = messageRes.result
        messagesOwnerId.value = targetId
      } else {
        errorMessage = messageRes.message
      }
    }

    isLoading.value = false
    return errorMessage
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
    if (!res.result) return { saved: false, error: res.message }

    // 用户消息在调 AI 前就已落库，AI 失败时也会带回来，所以直接入列
    messages.value.push(res.result.user_message)
    if (!res.result.assistant_message) return { saved: true, error: res.message }

    messages.value.push(res.result.assistant_message)
    return { saved: true, error: null }
  }

  return {
    // 状态
    currentSession,
    messages,
    messagesOwnerId,
    isLoading,
    isWaitingResponse,
    // 派生
    sessionId,
    characterName,
    // 动作
    clear,
    setCurrentSession,
    enterSession,
    sendMessage,
  }
})
