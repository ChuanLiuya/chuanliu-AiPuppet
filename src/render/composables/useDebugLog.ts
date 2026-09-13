/**
 * @description 调试日志组合式函数
 *
 * 职责：在前端调用后端 IPC 接口后，以分组形式输出调用结果。
 * 仅开发模式（由后端 systemInfo.debug 传递）输出，生产环境自动静默。
 */

/** 成功结果样式：绿色 */
const SUCCESS_STYLE = 'color: #4caf50;'
/** 错误结果样式：红色 */
const ERROR_STYLE = 'color: #f44336;'

/**
 * 输出 IPC 调用结果的调试日志
 *
 * @param channel 日志分组标题
 * @param result  要打印的内容
 * @param level   显式指定级别；传 'error' 时强制用红色分组。
 *                不传时沿用原有推断（Error 实例或 success === false 视为错误）
 */
export function debugLog(channel: string, result: unknown, level?: 'info' | 'error'): void {
  // 延迟读取，避免模块加载时 window.systemInfo 尚未注入
  if (!window.systemInfo?.debug) return
  const isError =
    level === 'error' ||
    result instanceof Error ||
    (result &&
      typeof result === 'object' &&
      'success' in result &&
      !(result as { success: boolean }).success)
  console.group(`%c ${channel}`, isError ? ERROR_STYLE : SUCCESS_STYLE)
  console.log(result)
  console.groupEnd()
}

/** 组合式函数入口，返回调试日志工具 */
export function useDebugLog() {
  return { debugLog }
}
