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
 * 发送对话的参数
 */
export interface ChatSendParams {
  /** API 配置 ID（对应 ApiConfigEntity.id） */
  api_config_id: number
  /** 消息列表（完整对话历史） */
  messages: ChatMessage[]
  /** 最大生成 token 数，默认 2048 */
  max_tokens?: number
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
