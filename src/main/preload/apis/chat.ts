
/**
 * @description 对话模块 —— 渲染进程 API（preload/apis/chat）
 *
 * 职责：封装 `ipcRenderer.invoke` 调用主进程的 chat:* 通道，是渲染进程
 * 访问后端（ChatController）能力的唯一入口。
 */
import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type { ChatSendParams, ChatReplyResult } from '@shared/types/chat'
import type { ApiResponse } from '@shared/types/api-response'

export const chatApi = {
  /**
   * 发送对话
   *
   * 通道：api:chat:chat
   *
   * @param params 对话参数（含 api_config_id 和消息列表）
   * @returns 统一响应结构，result 为 AI 回复内容
   */
  chat: (params: ChatSendParams): Promise<ApiResponse<ChatReplyResult>> =>
    ipcRenderer.invoke(IpcChannels.chat.chat, params),
}

/** chatApi 的类型，供 `env.d.ts` 声明 `window.electronAPI.chat` 使用 */
export type ChatApi = typeof chatApi
