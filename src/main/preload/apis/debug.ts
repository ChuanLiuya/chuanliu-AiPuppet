/**
 * @description 调试日志模块 —— 渲染进程 API（preload/apis/debug）
 *
 * 职责：订阅主进程推送的调试日志，转发到 DevTools 控制台。
 * 与 ipcRenderer.invoke 不同，这里是「主进程 → 渲染进程」的推送通道，用 on 订阅。
 */
import { ipcRenderer, type IpcRendererEvent } from 'electron'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type { DebugLogEntry } from '@shared/types/debug_log'

export const debugApi = {
  /**
   * 订阅主进程调试日志
   *
   * 通道：api:debug:log（主进程 → 渲染进程推送）
   *
   * @param callback 收到日志时的回调
   * @returns 取消订阅函数。应用级订阅可忽略，组件内订阅请在 onUnmounted 调用，
   *          否则监听器会随组件重复挂载而累积
   */
  onLog: (callback: (entry: DebugLogEntry) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, entry: DebugLogEntry) => callback(entry)
    ipcRenderer.on(IpcChannels.debug.log, listener)
    return () => {
      ipcRenderer.off(IpcChannels.debug.log, listener)
    }
  },
}

/** debugApi 的类型，供 `env.d.ts` 声明 `window.electronAPI.debug` 使用 */
export type DebugApi = typeof debugApi
