/**
 * 调试日志 —— 主进程侧
 *
 * 主进程的 console 输出只出现在终端里，DevTools 控制台看不到。
 * 这里把日志同时送到两个地方：
 * 1. 主进程终端（没开 DevTools 时也能看）
 * 2. 通过 IPC 推给所有渲染进程窗口，落进 DevTools 控制台（与 debugLog 输出在一起）
 *
 * 仅开发模式输出，生产环境完全静默。
 */
import axios, { type AxiosResponse } from 'axios'
import { BrowserWindow } from 'electron'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type { DebugLogEntry } from '@shared/types/debug_log'
import { env } from '@electron/config/env'

/** 敏感请求头名（统一转小写比较），打印前会被掩码 */
const SENSITIVE_HEADERS = ['authorization', 'x-api-key', 'api-key', 'proxy-authorization']

/** 掩码敏感值：保留首尾各 4 位便于核对，太短则整体打码 */
export function maskSecret(value: string): string {
  if (value.length <= 8) return '***'
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

/** 复制一份请求头并掩码敏感字段，避免把密钥打进日志 */
function maskHeaders(headers: Record<string, string>): Record<string, string> {
  const safe: Record<string, string> = {}
  for (const [name, value] of Object.entries(headers)) {
    safe[name] = SENSITIVE_HEADERS.includes(name.toLowerCase()) ? maskSecret(value) : value
  }
  return safe
}

/**
 * 打印一次 HTTP 请求
 *
 * 认证头会自动掩码，所以可以安全地把完整请求（URL + 头 + 体）打出来核对。
 *
 * @param title   日志标题，建议带上区分后缀，如 'chat.sendOpenAI · 请求'
 * @param request 请求三要素
 */
export function logHttpRequest(
  title: string,
  request: { url: string; headers: Record<string, string>; body: unknown },
): void {
  logInRender(title, {
    url: request.url,
    headers: maskHeaders(request.headers),
    body: request.body,
  })
}

/**
 * 打印一次 HTTP 响应
 *
 * 与 logHttpRequest 成对使用。标题带上区分后缀（'· 请求' / '· 响应'），
 * 在 DevTools 里就能一眼看出哪条是发出去的、哪条是收回来的。
 *
 * @param title     日志标题，如 'chat.sendOpenAI · 响应'
 * @param response  axios 响应对象
 * @param startedAt 请求开始的时间戳（可选，用于算耗时）
 */
export function logHttpResponse(
  title: string,
  response: AxiosResponse,
  startedAt?: number,
): void {
  logInRender(title, {
    status: response.status,
    statusText: response.statusText,
    duration_ms: startedAt != null ? Date.now() - startedAt : undefined,
    // 厂商返回的真实响应体
    data: response.data,
  })
}

/**
 * 打印一次 HTTP 失败
 *
 * axios 在非 2xx 时会抛错，而厂商返回的真实错误体在 err.response.data 里。
 * 不打出来的话，控制台就只剩一句 "Request failed with status code 401"，
 * 根本看不出到底是密钥错了、余额不足，还是模型名不对。
 *
 * @param title     日志标题，如 'chat.sendOpenAI · 失败'
 * @param error     捕获到的异常
 * @param startedAt 请求开始的时间戳（可选，用于算耗时）
 */
export function logHttpError(title: string, error: unknown, startedAt?: number): void {
  const info: Record<string, unknown> = {
    message: error instanceof Error ? error.message : String(error),
  }
  if (startedAt != null) info.duration_ms = Date.now() - startedAt

  if (axios.isAxiosError(error)) {
    if (error.code) info.code = error.code
    if (error.response) {
      info.status = error.response.status
      // 厂商的真实错误体
      info.data = error.response.data
    }
  }

  logInRender(title, info, 'error')
}

/**
 * 输出调试日志：所有渲染进程窗口的 DevTools
 *
 * @param title   日志标题
 * @param payload 日志内容，必须是可结构化克隆的普通数据
 * @param level   日志级别，'error' 时渲染进程用红色分组
 */
export function logInRender(title: string, payload: unknown, level?: 'info' | 'error'): void {
  if (!env.isDev) return
  const entry: DebugLogEntry = { title, payload, level }
  for (const win of BrowserWindow.getAllWindows()) {
    // 窗口可能正在销毁，此时 send 会抛错
    if (win.isDestroyed()) continue
    win.webContents.send(IpcChannels.debug.log, entry)
  }
}
