/**
 * @description 会话模块 —— 渲染进程 API（preload/apis/chatSession）
 *
 * 职责：封装 `ipcRenderer.invoke` 调用主进程的 chatSession:* 通道。
 * 方法名与 `IpcChannels.chatSession` 中的通道名一一对应。
 *
 * 类型来源（双保险）：
 * - 数据契约 `ChatSessionDTO` / `ChatSessionCreateInput` / `ChatSessionUpdateInput`
 *   来自 `@shared/types/chat`
 * - 本文件导出的 `ChatSessionApi = typeof chatSessionApi` 随方法签名自动推导，
 *   `env.d.ts` 用它声明 `window.electronAPI.chatSession`
 */
import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type {
  ChatSessionDTO,
  ChatSessionListItem,
  ChatSessionCreateInput,
  ChatSessionUpdateInput,
} from '@shared/types/chat'
import type { ApiResponse } from '@shared/types/api-response'

export const chatSessionApi = {
  /**
   * 查找全部会话（按最后更新时间倒序）
   *
   * 通道：api:chatSession:findAll
   */
  findAll: (): Promise<ApiResponse<ChatSessionDTO[]>> =>
    ipcRenderer.invoke(IpcChannels.chatSession.findAll),

  /**
   * 查找全部会话，并附带最后一条消息摘要（列表页用）
   *
   * 通道：api:chatSession:listWithPreview
   */
  listWithPreview: (): Promise<ApiResponse<ChatSessionListItem[]>> =>
    ipcRenderer.invoke(IpcChannels.chatSession.listWithPreview),

  /**
   * 通过 id 查找单个会话
   *
   * 通道：api:chatSession:findOneById
   *
   * @param id 会话 id
   * @returns 找到的会话记录；不存在时为 null
   */
  findOneById: (id: number): Promise<ApiResponse<ChatSessionDTO | null>> =>
    ipcRenderer.invoke(IpcChannels.chatSession.findOneById, id),

  /**
   * 创建一个会话
   *
   * 通道：api:chatSession:create
   *
   * @param data 创建入参（character_name 必填，title 省略时用角色名兜底）
   * @returns 新创建记录的 id
   */
  create: (data: ChatSessionCreateInput): Promise<ApiResponse<number>> =>
    ipcRenderer.invoke(IpcChannels.chatSession.create, data),

  /**
   * 修改一个会话
   *
   * 通道：api:chatSession:update
   *
   * @param id   要修改的会话 id
   * @param data 需要更新的字段（只传要改的字段）
   * @returns 更新后的会话记录；id 不存在时为 null
   */
  update: (id: number, data: ChatSessionUpdateInput): Promise<ApiResponse<ChatSessionDTO | null>> =>
    ipcRenderer.invoke(IpcChannels.chatSession.update, id, data),

  /**
   * 删除一个会话（连同其下所有消息）
   *
   * 通道：api:chatSession:remove
   */
  remove: (id: number): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke(IpcChannels.chatSession.remove, id),
}

/** chatSessionApi 的类型，供 `env.d.ts` 声明 `window.electronAPI.chatSession` 使用 */
export type ChatSessionApi = typeof chatSessionApi
