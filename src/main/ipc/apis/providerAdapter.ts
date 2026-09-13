/**
 * 协议适配器 —— 把各厂商的 HTTP 差异收敛到一处
 *
 * 「构造请求 → 发送 → 解析响应」的逻辑都在这里，
 * 供 ChatController（对话）与 ApiConfigController（连接测试）复用。
 *
 * 目前只实现 OpenAI 兼容格式（覆盖 OpenAI / DeepSeek / OpenRouter / 各类中转站），
 * Claude / Gemini 等其他协议后续按需补充。
 *
 * 失败时统一抛出 Error，由调用方包装成自己的 ApiResponse，
 * 从而保留各自的语义前缀（如「对话失败」「连接测试失败」）。
 */
import axios from 'axios'
import type { ApiConfigEntity } from '@electron/database/entities/api_config'
import type { ChatMessage, ChatReplyResult } from '@shared/types/chat'

/** 默认超时（毫秒） */
const DEFAULT_TIMEOUT = 60000

/** 默认最大生成 token 数 */
const DEFAULT_MAX_TOKENS = 2048

/** 去掉 base_url 末尾的斜杠，避免拼出 `//v1/...` */
export function trimSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

/**
 * 发送一次对话请求（OpenAI 兼容格式）
 *
 * 请求：POST {base_url}/v1/chat/completions
 * 认证：Authorization: Bearer <key>
 *
 * @param cfg       该次对话使用的 API 配置（含 base_url、model、关联密钥）
 * @param messages  消息列表（完整对话历史，约定上是最主要的参数）
 * @param options   可选的生成参数与超时
 * @returns AI 回复文本与结束原因
 * @throws 请求失败或响应无法解析时抛出 Error
 */
export async function sendOpenAI(
  cfg: ApiConfigEntity,
  messages: ChatMessage[],
  options: { max_tokens?: number; timeout?: number } = {},
): Promise<ChatReplyResult> {
  const res = await axios({
    method: 'post',
    url: `${trimSlash(cfg.base_url)}/v1/chat/completions`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.api_key.key}`,
    },
    data: {
      model: cfg.model,
      max_tokens: options.max_tokens ?? DEFAULT_MAX_TOKENS,
      messages,
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
