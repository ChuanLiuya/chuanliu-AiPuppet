/**
 * API 接口协议类型
 *
 * 决定「用哪套 HTTP 规则」与该服务通信（请求路径、认证头、请求/响应结构）。
 *
 * 注意：协议 ≠ 厂商。中转站用 OpenAI 兼容格式提供 Claude 模型时，协议仍是 openai。
 * 主进程据此分派请求构造逻辑，渲染进程据此渲染下拉选项，两端共用同一份定义。
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
  { label: 'OpenAI 兼容（DeepSeek / OpenRouter / 中转站）', value: ApiProtocol.OPENAI },
  { label: 'Claude（Anthropic 原生）', value: ApiProtocol.CLAUDE },
  { label: 'Gemini（Google 原生）', value: ApiProtocol.GEMINI },
]

/** 协议短名称，用于表格等空间有限的场景 */
export const API_PROTOCOL_LABELS: Record<ApiProtocol, string> = {
  [ApiProtocol.OPENAI]: 'OpenAI 兼容',
  [ApiProtocol.CLAUDE]: 'Claude',
  [ApiProtocol.GEMINI]: 'Gemini',
}
