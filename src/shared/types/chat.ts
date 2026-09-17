/**
 * 消息角色
 *
 * 与 OpenAI Chat Completions 的 role 对齐：`system`（系统提示）、`user`（用户）、
 * `assistant`（AI 回复）。将来要接工具调用、旁白等，在这里补新值即可。
 */
export type ChatRole = 'system' | 'user' | 'assistant'

/**
 * 对话消息类型
 *
 * 兼容 OpenAI Chat Completions API 的消息格式。
 */
export interface ChatMessage {
  /** 角色：system（系统提示词）、user（用户）、assistant（AI 回复） */
  role: ChatRole
  /** 消息内容 */
  content: string
}

/**
 * AI 回复结果
 */
export interface ChatReplyResult {
  /** AI 回复的文本内容 */
  content: string
  /** 模型返回的 finish_reason */
  finish_reason?: string
}

/**
 * 一个会话（历史记录的容器）
 *
 * 一个角色可以有多个会话，类似 SillyTavern「同一个角色开多条聊天记录」。
 * 角色信息暂以纯文本冗余存储（角色表尚未落地），将来接上角色表后可改为外键。
 */
export interface ChatSessionDTO {
  /** 会话 id */
  id: number
  /** 会话标题（列表页展示） */
  title: string
  /**
   * 角色卡（兼容两态字段）
   *
   * - 角色卡功能落地前：直接存纯文本角色名（当前形态，如「苏妲己」）
   * - 角色卡功能落地后：存角色卡地址（如 `res://characters/苏妲己.json`）
   *
   * 两种形态都是字符串，取值时不要直接当名字用，
   * 一律走 `@shared/utils/character_card` 的
   * `isCharacterCardRef()` / `resolveCharacterDisplayName()` 判定与取展示名。
   */
  character_card: string
  /** 创建时间 */
  created_at: Date
  /** 最后更新时间（有新消息时刷新，列表按此倒序排列） */
  updated_at: Date
}

/** 创建一个会话的参数（title 可省略，省略时用角色展示名兜底） */
export type ChatSessionCreateInput = Pick<ChatSessionDTO, 'character_card'> &
  Partial<Pick<ChatSessionDTO, 'title'>>

/** 更新一个会话的可选字段 */
export type ChatSessionUpdateInput = Partial<ChatSessionCreateInput>

/**
 * 会话列表项（会话 + 最后一条消息的摘要）
 *
 * 列表页需要「最近一次聊天内容」做预览，但会话表本身不存正文，
 * 因此由后端联查后拼出这个派生结构，不落库。
 */
export interface ChatSessionListItem extends ChatSessionDTO {
  /** 最后一条消息的正文；该会话还没有消息时为 null */
  last_message: string | null
}

/**
 * 一条聊天消息（历史记录的最小单元）
 *
 * 身份用单一的 `role` 字符串表达（user / assistant / system …），与接口协议对齐；
 * 具体是谁说的另外记在 `name` 上（群聊里多个角色、旁白都能靠它区分）。
 * 发给 AI 的消息由 providerAdapter 直接取 `role`，存储层与协议不再有推导关系。
 */
export interface ChatMessageDTO {
  /** 消息 id */
  id: number
  /** 所属会话 id */
  session_id: number
  /** 发送者名字（用户人设名 / 角色名 / 系统名） */
  name: string
  /** 消息角色 */
  role: ChatRole
  /** 正文 */
  content: string
  /** 杂项元数据（生成参数、推理过程、工具调用等，预留） */
  extra: Record<string, unknown> | null
  /** 创建时间 */
  created_at: Date
}

/** 创建一条消息的参数（extra 可省略） */
export type ChatMessageCreateInput = Pick<
  ChatMessageDTO,
  'session_id' | 'name' | 'role' | 'content'
> &
  Partial<Pick<ChatMessageDTO, 'extra'>>

/** 更新一条消息的可选字段（不允许改所属会话与创建时间） */
export type ChatMessageUpdateInput = Partial<
  Omit<ChatMessageDTO, 'id' | 'session_id' | 'created_at'>
>

/**
 * 发送一条消息的参数
 */
export interface ChatSendMessageParams {
  /** 会话 id */
  session_id: number
  /** 用户输入的文本 */
  content: string
  /** 用户人设名，默认「你」 */
  user_name?: string
  /** 最大生成 token 数，默认 2048 */
  max_tokens?: number
}

/**
 * 发送一条消息的结果
 */
export interface ChatSendMessageResult {
  /**
   * 已落库的用户消息
   *
   * 即使后续 AI 调用失败，用户消息也会保留（与 SillyTavern 一致，避免丢输入）。
   */
  user_message: ChatMessageDTO
  /** AI 回复消息；生成失败时为 null */
  assistant_message: ChatMessageDTO | null
}
