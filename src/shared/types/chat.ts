/**
 * 对话消息类型
 *
 * 兼容 OpenAI Chat Completions API 的消息格式。
 */
export interface ChatMessage {
  /** 角色：system（系统提示词）、user（用户）、assistant（AI 回复） */
  role: 'system' | 'user' | 'assistant'
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
  /** 角色名 */
  character_name: string
  /** 角色头像（emoji 或图片标识） */
  avatar: string
  /** 该会话使用的 API 配置 id；为 null 表示回退到全局选中的配置 */
  api_config_id: number | null
  /** 创建时间 */
  created_at: Date
  /** 最后更新时间（有新消息时刷新，列表按此倒序排列） */
  updated_at: Date
}

/** 创建一个会话的参数（title / avatar / api_config_id 可省略） */
export type ChatSessionCreateInput = Pick<ChatSessionDTO, 'character_name'> &
  Partial<Pick<ChatSessionDTO, 'title' | 'avatar' | 'api_config_id'>>

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
 * 设计参照 SillyTavern：身份用 `is_user` / `is_system` 两个布尔位表达，
 * 而不是 role 字符串——这样群聊（多个角色名）、旁白、隐藏消息都能容纳。
 * 真正发给 AI 的 `role` 由 providerAdapter 在发送前现场推导，两者解耦。
 */
export interface ChatMessageDTO {
  /** 消息 id */
  id: number
  /** 所属会话 id */
  session_id: number
  /** 发送者名字（用户人设名 / 角色名 / 系统名） */
  name: string
  /** 是否为用户发送 */
  is_user: boolean
  /** 是否为系统/隐藏消息（默认不发送给 AI，仅界面展示） */
  is_system: boolean
  /** 正文 */
  mes: string
  /** 杂项元数据（生成参数、推理过程、工具调用等，预留） */
  extra: Record<string, unknown> | null
  /** 同一位置的多条候选回复（重新生成用，预留） */
  swipes: string[] | null
  /** 当前选中的候选下标 */
  swipe_id: number
  /** 创建时间 */
  created_at: Date
}

/** 创建一条消息的参数（is_system / extra / swipes / swipe_id 可省略） */
export type ChatMessageCreateInput = Pick<
  ChatMessageDTO,
  'session_id' | 'name' | 'is_user' | 'mes'
> &
  Partial<Pick<ChatMessageDTO, 'is_system' | 'extra' | 'swipes' | 'swipe_id'>>

/** 更新一条消息的可选字段（不允许改所属会话与创建时间） */
export type ChatMessageUpdateInput = Partial<
  Omit<ChatMessageDTO, 'id' | 'session_id' | 'created_at'>
>

/**
 * 发送一条消息的参数（自带历史记录持久化）
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
