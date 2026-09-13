/**
 * 调试日志条目
 *
 * 主进程通过 IPC 推送给渲染进程，由渲染进程落到 DevTools 控制台。
 * payload 必须是可结构化克隆的普通数据（不能传函数、class 实例、Vue 响应式代理）。
 */
export interface DebugLogEntry {
  /** 日志分组标题，如 'chat.sendOpenAI' */
  title: string
  /** 日志内容 */
  payload: unknown
}
