/**
 * API 接口协议类型
 *
 * 决定「用哪套 HTTP 规则」与该服务通信（请求路径、认证头、请求/响应结构）。
 * 举个例子：
 * 如果选择的是openai协议，发送对话请求时会 POST /v1/chat/completions，Authorization: Bearer <key>，请求体和响应体都遵循 OpenAI 的格式。
 * 如果选择的是claude协议，发送对话请求时会 POST /v1/messages，Authorization: Bearer <key>，请求
 * 数据库存储这个到 ApiConfigEntity 中，主进程根据这个发送不同类型的请求，渲染进程据此渲染下拉选项，两端共用同一份定义。
 */
export const ApiProtocol = {
  /** OpenAI 兼容格式：OpenAI / DeepSeek / OpenRouter / 各类中转站 */
  OPENAI: 'openai',
  /** Anthropic Messages API */
  CLAUDE: 'claude',
  /** Google Generative Language API */
  GEMINI: 'gemini',
} as const

export type ApiProtocol = (typeof ApiProtocol)[keyof typeof ApiProtocol]

/** 协议的全部取值，用于校验与遍历 */
export const API_PROTOCOLS: ApiProtocol[] = Object.values(ApiProtocol)

/** 前端下拉框选项 */
export const API_PROTOCOL_OPTIONS = [
  { label: 'OpenAI', value: ApiProtocol.OPENAI, disabled: false },
  { label: 'Claude', value: ApiProtocol.CLAUDE, disabled: true },
  { label: 'Gemini', value: ApiProtocol.GEMINI, disabled: true },
]

/** 协议短名称，用于表格等空间有限的场景 */
export const API_PROTOCOL_LABELS: Record<ApiProtocol, string> = {
  [ApiProtocol.OPENAI]: 'OpenAI 兼容',
  [ApiProtocol.CLAUDE]: 'Claude',
  [ApiProtocol.GEMINI]: 'Gemini',
}
