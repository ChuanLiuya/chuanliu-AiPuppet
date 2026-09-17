/**
 * @description 聊天历史模块 —— 渲染进程 API（preload/apis/chatHistory）
 *
 * 职责：封装 `ipcRenderer.invoke` 调用主进程的 chatHistory:* 通道。
 * 方法名与 `IpcChannels.chatHistory` 中的通道名一一对应。
 *
 * 类型来源（双保险）：
 * - 数据契约 `ChatHistoryDTO` / `ChatHistoryCreateInput` / `ChatHistoryUpdateInput`
 *   来自 `@shared/types/chat`
 * - 本文件导出的 `ChatHistoryApi = typeof chatHistoryApi` 随方法签名自动推导，
 *   `env.d.ts` 用它声明 `window.electronAPI.chatHistory`
 */
import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type {
  ChatHistoryDTO,
  ChatHistoryCreateInput,
  ChatHistoryUpdateInput,
} from '@shared/types/chat'
import type { ApiResponse } from '@shared/types/api-response'

export const chatHistoryApi = {
  /**
   * 查找某个会话下的全部历史（按时间升序）
   *
   * 通道：api:chatHistory:findAll
   *
   * @param sessionId 会话 id
   */
  findAll: (sessionId: number): Promise<ApiResponse<ChatHistoryDTO[]>> =>
    ipcRenderer.invoke(IpcChannels.chatHistory.findAll, sessionId),

  /**
   * 通过 id 查找单条历史
   *
   * 通道：api:chatHistory:findOneById
   *
   * @returns 找到的记录；不存在时为 null
   */
  findOneById: (id: number): Promise<ApiResponse<ChatHistoryDTO | null>> =>
    ipcRenderer.invoke(IpcChannels.chatHistory.findOneById, id),

  /**
   * 新增一条历史
   *
   * 通道：api:chatHistory:create
   *
   * @param data 创建入参（session_id / name / role / content 必填）
   * @returns 新创建记录的 id
   */
  create: (data: ChatHistoryCreateInput): Promise<ApiResponse<number>> =>
    ipcRenderer.invoke(IpcChannels.chatHistory.create, data),

  /**
   * 修改一条历史
   *
   * 通道：api:chatHistory:update
   *
   * @param id   要修改的记录 id
   * @param data 需要更新的字段（只传要改的字段）
   * @returns 更新后的记录；id 不存在时为 null
   */
  update: (
    id: number,
    data: ChatHistoryUpdateInput,
  ): Promise<ApiResponse<ChatHistoryDTO | null>> =>
    ipcRenderer.invoke(IpcChannels.chatHistory.update, id, data),

  /**
   * 删除一条历史
   *
   * 通道：api:chatHistory:remove
   */
  remove: (id: number): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke(IpcChannels.chatHistory.remove, id),

  /**
   * 清空某个会话下的全部历史
   *
   * 通道：api:chatHistory:clear
   *
   * @param sessionId 会话 id
   */
  clear: (sessionId: number): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke(IpcChannels.chatHistory.clear, sessionId),
}

/** chatHistoryApi 的类型，供 `env.d.ts` 声明 `window.electronAPI.chatHistory` 使用 */
export type ChatHistoryApi = typeof chatHistoryApi
