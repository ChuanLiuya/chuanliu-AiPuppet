
/**
 * @description 对话模块 —— 渲染进程 API（preload/apis/chat）
 *
 * 职责：封装 `ipcRenderer.invoke` 调用主进程的 chat:* 通道，是渲染进程
 * 访问后端（ChatController）能力的唯一入口。
 */
import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type { ChatSendMessageParams, ChatSendMessageResult } from '@shared/types/chat'
import type { ApiResponse } from '@shared/types/api-response'

export const chatApi = {
  /**
   * 发送一条消息（自动读写历史记录）
   *
   * 通道：api:chat:send
   *
   * 主进程会把用户消息落库、拼上该会话的历史一起发给 AI、
   * 再把 AI 回复落库，因此前端只需要传会话 id 和文本。
   *
   * @param params 发送参数（会话 id + 文本 + 可选人设名）
   * @returns 落库后的用户消息与 AI 回复；AI 失败时 assistant_message 为 null，
   *          但 user_message 仍已保存
   */
  send: (params: ChatSendMessageParams): Promise<ApiResponse<ChatSendMessageResult>> =>
    ipcRenderer.invoke(IpcChannels.chat.send, params),
}

/** chatApi 的类型，供 `env.d.ts` 声明 `window.electronAPI.chat` 使用 */
export type ChatApi = typeof chatApi
