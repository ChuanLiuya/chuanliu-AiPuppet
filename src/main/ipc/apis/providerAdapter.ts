/**
 * 协议适配器 —— 把各厂商的 HTTP 差异收敛到一处
 *
 * 「按协议构造请求 → 发送 → 解析响应」的全部逻辑都在这里，
 * 供 ChatController（对话）与 ApiConfigController（连接测试）复用，
 * 避免 Claude / Gemini 的特殊逻辑在两个控制器里各写一遍。
 *
 * 失败时统一抛出 Error，由调用方包装成自己的 ApiResponse，
 * 从而保留各自的语义前缀（如「对话失败」「连接测试失败」）。
 */
import axios from 'axios'
import { ApiProtocol } from '@shared/constants/api_protocol'
import type { ChatMessage, ChatReplyResult } from '@shared/types/chat'

/** 发起一次对话所需的最小配置（ApiConfigEntity 的结构子集） */
export interface ChatTarget {
  /** API 基础路径 */
  base_url: string
  /** 模型名称 */
  model: string
  /** 关联密钥 */
  api_key: { key: string }
}

/** 对话参数 */
export interface ChatOptions {
  /** 消息列表（完整对话历史） */
  messages: ChatMessage[]
  /** 最大生成 token 数，默认 2048 */
  max_tokens?: number
  /** 超时毫秒数，默认 60000 */
  timeout?: number
}

/** 默认超时（毫秒） */
const DEFAULT_TIMEOUT = 60000

/** 默认最大生成 token 数 */
const DEFAULT_MAX_TOKENS = 2048

/** 把消息里所有 system 内容合并成一个字符串（Claude / Gemini 需要单独传） */
function collectSystem(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n')
}

/** 去掉 base_url 末尾的斜杠，避免拼出 `//v1/...` */
export function trimSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

/**
 * 按协议发送一次对话请求
 *
 * @param protocol 接口协议类型
 * @param target   目标配置（地址 + 模型 + 密钥）
 * @param options  消息与生成参数
 * @returns AI 回复文本与结束原因
 * @throws 请求失败或响应无法解析时抛出 Error
 */
export async function sendChat(
  protocol: ApiProtocol,
  target: ChatTarget,
  options: ChatOptions,
): Promise<ChatReplyResult> {
  switch (protocol) {
    case ApiProtocol.CLAUDE:
      return sendClaude(target, options)
    case ApiProtocol.GEMINI:
      return sendGemini(target, options)
    default:
      return sendOpenAI(target, options)
  }
}

/**
 * OpenAI 兼容格式：Bearer 认证 + /v1/chat/completions
 *
 * 覆盖 OpenAI / DeepSeek / OpenRouter / 各类中转站。
 */
async function sendOpenAI(target: ChatTarget, options: ChatOptions): Promise<ChatReplyResult> {
  const res = await axios({
    method: 'post',
    url: `${trimSlash(target.base_url)}/v1/chat/completions`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${target.api_key.key}`,
    },
    data: {
      model: target.model,
      max_tokens: options.max_tokens ?? DEFAULT_MAX_TOKENS,
      messages: options.messages,
    },
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
  })

  const choice = res.data?.choices?.[0]
  if (!choice) throw new Error('AI 未返回有效回复')

  return {
    content: choice.message?.content ?? '',
    finish_reason: choice.finish_reason,
  }
}

/**
 * Anthropic Messages API
 *
 * 与 OpenAI 的三处关键差异：
 * 1. 路径是 /v1/messages，不是 /v1/chat/completions
 * 2. 认证用 x-api-key 头，且必须带 anthropic-version
 * 3. messages 里不允许出现 system 角色，需提升为顶层 system 字段
 */
async function sendClaude(target: ChatTarget, options: ChatOptions): Promise<ChatReplyResult> {
  const system = collectSystem(options.messages)
  const messages = options.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }))

  const res = await axios({
    method: 'post',
    url: `${trimSlash(target.base_url)}/v1/messages`,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': target.api_key.key,
      // 必带，缺失时 Anthropic 直接返回 400
      'anthropic-version': '2023-06-01',
    },
    data: {
      model: target.model,
      // Claude 的 max_tokens 是必填项
      max_tokens: options.max_tokens ?? DEFAULT_MAX_TOKENS,
      ...(system ? { system } : {}),
      messages,
    },
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
  })

  // 响应结构：{ content: [{ type: 'text', text: '...' }], stop_reason }
  const parts = Array.isArray(res.data?.content) ? res.data.content : []
  const text = parts
    .filter((p: { type?: string }) => p?.type === 'text')
    .map((p: { text?: string }) => p.text ?? '')
    .join('')

  if (!text) throw new Error('AI 未返回有效回复')

  return {
    content: text,
    finish_reason: res.data?.stop_reason,
  }
}

/**
 * Google Generative Language API（AI Studio / Gemini）
 *
 * 与 OpenAI 的三处关键差异：
 * 1. 路径是 /v1beta/models/{model}:generateContent，模型名在路径里
 * 2. 密钥走查询参数 ?key=，不放请求头
 * 3. 请求体用 contents/parts 结构，助手角色叫 model，system 走 systemInstruction
 */
async function sendGemini(target: ChatTarget, options: ChatOptions): Promise<ChatReplyResult> {
  const system = collectSystem(options.messages)
  const contents = options.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      // Gemini 把助手角色命名为 model
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const res = await axios({
    method: 'post',
    url: `${trimSlash(target.base_url)}/v1beta/models/${encodeURIComponent(target.model)}:generateContent`,
    // 密钥走查询参数，axios 会自动 encode
    params: { key: target.api_key.key },
    headers: { 'Content-Type': 'application/json' },
    data: {
      contents,
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      generationConfig: { maxOutputTokens: options.max_tokens ?? DEFAULT_MAX_TOKENS },
    },
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
  })

  const candidate = res.data?.candidates?.[0]

  // 被安全策略拦截时没有 candidates，只有 promptFeedback
  if (!candidate) {
    const reason = res.data?.promptFeedback?.blockReason
    throw new Error(reason ? `请求被 Gemini 拦截：${reason}` : 'AI 未返回有效回复')
  }

  // 响应结构：{ candidates: [{ content: { parts: [{ text }] }, finishReason }] }
  const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : []
  const text = parts
    .map((p: { text?: string }) => p.text ?? '')
    .join('')

  if (!text) throw new Error('AI 未返回有效回复')

  return {
    content: text,
    finish_reason: candidate?.finishReason,
  }
}
