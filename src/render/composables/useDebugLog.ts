/**
 * @description 调试日志组合式函数
 *
 * 职责：在前端调用后端 IPC 接口后，以分组形式输出调用结果。
 * 仅开发模式（由后端 systemInfo.debug 传递）输出，生产环境自动静默。
 */

/** 分组标题样式：青色加粗 */
const TITLE_STYLE = 'color: #00bcd4; font-weight: bold; font-size: 13px;'
/** 成功结果样式：绿色 */
const SUCCESS_STYLE = 'color: #4caf50;'
/** 错误结果样式：红色 */
const ERROR_STYLE = 'color: #f44336;'
/** 普通信息样式：灰色 */
const INFO_STYLE = 'color: #9e9e9e;'

/**
 * 输出 IPC 调用结果的调试日志
 *
 * 以 console.group 分组展示：标题为通道名，内容为返回结果。
 * 仅当 systemInfo.debug 为 true 时输出。
 *
 * @param channel  IPC 通道名（如 'api:cat:findAll'）
 * @param result   IPC 调用返回的结果
 */
export function debugLog(channel: string, result: unknown): void {
  // 延迟读取，避免模块加载时 window.systemInfo 尚未注入
  if (!window.systemInfo?.debug) return

  const isError = result instanceof Error || (result && typeof result === 'object' && 'success' in result && !(result as { success: boolean }).success)

  console.group(`%c[IPC] ${channel}`, isError ? ERROR_STYLE : TITLE_STYLE)
  if (isError) {
    console.log('%c✗ 调用失败', ERROR_STYLE)
    console.log('%c结果：', ERROR_STYLE, result)
  } else {
    console.log('%c✓ 调用成功', SUCCESS_STYLE)
    console.log('%c结果：', INFO_STYLE, result)
  }
  console.groupEnd()
}

/** 组合式函数入口，返回调试日志工具 */
export function useDebugLog() {
  return { debugLog }
}
