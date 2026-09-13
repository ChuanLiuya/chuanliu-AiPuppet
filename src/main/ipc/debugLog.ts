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
 * @param title   日志标题，如 'chat.sendOpenAI'
 * @param request 请求三要素
 */
export function logHttpRequest(
  title: string,
  request: { url: string; headers: Record<string, string>; body: unknown },
): void {
  mainDebugLog(title, {
    url: request.url,
    headers: maskHeaders(request.headers),
    body: request.body,
  })
}

/**
 * 输出调试日志：主进程终端 + 所有渲染进程窗口的 DevTools
 *
 * @param title   日志标题
 * @param payload 日志内容，必须是可结构化克隆的普通数据
 */
export function mainDebugLog(title: string, payload: unknown): void {
  if (!env.isDev) return

  console.log(`[${title}]`, payload)

  const entry: DebugLogEntry = { title, payload }
  for (const win of BrowserWindow.getAllWindows()) {
    // 窗口可能正在销毁，此时 send 会抛错
    if (win.isDestroyed()) continue
    win.webContents.send(IpcChannels.debug.log, entry)
  }
}
