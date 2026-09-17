/**
 * @description 聊天消息模块 —— 渲染进程 API（preload/apis/chatMessage）
 *
 * 职责：封装 `ipcRenderer.invoke` 调用主进程的 chatMessage:* 通道。
 * 方法名与 `IpcChannels.chatMessage` 中的通道名一一对应。
 *
 * 类型来源（双保险）：
 * - 数据契约 `ChatMessageDTO` / `ChatMessageCreateInput` / `ChatMessageUpdateInput`
 *   来自 `@shared/types/chat`
 * - 本文件导出的 `ChatMessageApi = typeof chatMessageApi` 随方法签名自动推导，
 *   `env.d.ts` 用它声明 `window.electronAPI.chatMessage`
 */
import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type {
  ChatMessageDTO,
  ChatMessageCreateInput,
  ChatMessageUpdateInput,
} from '@shared/types/chat'
import type { ApiResponse } from '@shared/types/api-response'

export const chatMessageApi = {
  /**
   * 查找某个会话下的全部消息（按时间升序）
   *
   * 通道：api:chatMessage:findAll
   *
   * @param sessionId 会话 id
   */
  findAll: (sessionId: number): Promise<ApiResponse<ChatMessageDTO[]>> =>
    ipcRenderer.invoke(IpcChannels.chatMessage.findAll, sessionId),

  /**
   * 通过 id 查找单条消息
   *
   * 通道：api:chatMessage:findOneById
   *
   * @returns 找到的消息记录；不存在时为 null
   */
  findOneById: (id: number): Promise<ApiResponse<ChatMessageDTO | null>> =>
    ipcRenderer.invoke(IpcChannels.chatMessage.findOneById, id),

  /**
   * 新增一条消息
   *
   * 通道：api:chatMessage:create
   *
   * @param data 创建入参（session_id / name / role / content 必填）
   * @returns 新创建记录的 id
   */
  create: (data: ChatMessageCreateInput): Promise<ApiResponse<number>> =>
    ipcRenderer.invoke(IpcChannels.chatMessage.create, data),

  /**
   * 修改一条消息
   *
   * 通道：api:chatMessage:update
   *
   * @param id   要修改的消息 id
   * @param data 需要更新的字段（只传要改的字段）
   * @returns 更新后的消息记录；id 不存在时为 null
   */
  update: (id: number, data: ChatMessageUpdateInput): Promise<ApiResponse<ChatMessageDTO | null>> =>
    ipcRenderer.invoke(IpcChannels.chatMessage.update, id, data),

  /**
   * 删除一条消息
   *
   * 通道：api:chatMessage:remove
   */
  remove: (id: number): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke(IpcChannels.chatMessage.remove, id),

  /**
   * 清空某个会话下的全部消息
   *
   * 通道：api:chatMessage:clear
   *
   * @param sessionId 会话 id
   */
  clear: (sessionId: number): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke(IpcChannels.chatMessage.clear, sessionId),
}

/** chatMessageApi 的类型，供 `env.d.ts` 声明 `window.electronAPI.chatMessage` 使用 */
export type ChatMessageApi = typeof chatMessageApi
