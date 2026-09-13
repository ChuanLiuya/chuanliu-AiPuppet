/**
 * API 接口协议类型
 *
 * 决定「用哪套 HTTP 规则」与该服务通信（请求路径、认证头、请求/响应结构）。
 *
 * 各协议在「发送对话」时的差异：
 * - openai：POST /v1/chat/completions，Authorization: Bearer <key>
 * - claude：POST /v1/messages，x-api-key: <key>（另需 anthropic-version 头）
 * - gemini：POST /v1beta/models/{model}:generateContent?key=<key>
 *
 * 该值存在 ApiConfigEntity.protocol 中：主进程据此构造请求，
 * 渲染进程据此渲染下拉选项，两端共用同一份定义。
 */

/**
 * 协议取值常量映射
 * - 用于避免魔法字符串
 * - 用 ApiProtocol.OPENAI 这样访问，表示使用的协议是openai的api协议。
 */
export const ApiProtocol = {
  /** OpenAI 兼容格式：OpenAI / DeepSeek / OpenRouter / 各类中转站 */
  OPENAI: 'openai',
  /** Anthropic Messages API */
  CLAUDE: 'claude',
  /** Google Generative Language API */
  GEMINI: 'gemini',
} as const

/**
 * 协议类型
 * - 用于 TypeScript 类型检查
 * - 目前等价于 `'openai' | 'claude' | 'gemini'`。
 *
 */
export type ApiProtocolType = (typeof ApiProtocol)[keyof typeof ApiProtocol]

/** 协议的全部取值，用于校验与遍历 */
export const API_PROTOCOLS: ApiProtocolType[] = Object.values(ApiProtocol)

/**
 * 前端下拉框选项
 *
 * 例如，api编辑时的接口协议表单中。
*/
export const API_PROTOCOL_OPTIONS = [
  { label: 'OpenAI', value: ApiProtocol.OPENAI, disabled: false },
  { label: 'Claude', value: ApiProtocol.CLAUDE, disabled: true },
  { label: 'Gemini', value: ApiProtocol.GEMINI, disabled: true },
]

/**
 * 协议短名称
 *
 * 用于表格等。
 *
 * 例如：用于前端api配置展示表格中。
*/
export const API_PROTOCOL_LABELS: Record<ApiProtocolType, string> = {
  [ApiProtocol.OPENAI]: 'OpenAI',
  [ApiProtocol.CLAUDE]: 'Claude',
  [ApiProtocol.GEMINI]: 'Gemini',
}
