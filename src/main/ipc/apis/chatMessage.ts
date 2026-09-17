/**
 * 聊天消息模块 —— 主进程 Controller
 *
 * 职责：处理 chatMessage:* 通道的 IPC 请求，对 chat_history 表做 CRUD。
 * 通道定义见 @shared/constants/ipc_channels，数据契约见 @shared/types/chat。
 */
import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { ChatHistoryEntity } from '@electron/database/entities/chat_history'
import { ChatSessionEntity } from '@electron/database/entities/chat_session'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type { ChatMessageDTO, ChatMessageCreateInput, ChatMessageUpdateInput } from '@shared/types/chat'
import { success, error, type ApiResponse } from '@shared/types/api-response'

export class ChatMessageController {
  /** 懒获取 chat_history 表的仓库 */
  private get repo() {
    return dataSource.getRepository(ChatHistoryEntity)
  }

  /** 懒获取 chat_session 表的仓库（新增消息后刷新会话更新时间） */
  private get sessionRepo() {
    return dataSource.getRepository(ChatSessionEntity)
  }

  /** 注册所有 chatMessage 相关的 IPC 通道 */
  register() {
    ipcMain.handle(IpcChannels.chatMessage.findAll, (_e, sessionId: number) => this.findAll(sessionId))
    ipcMain.handle(IpcChannels.chatMessage.findOneById, (_e, id: number) => this.findOneById(id))
    ipcMain.handle(IpcChannels.chatMessage.create, (_e, data: ChatMessageCreateInput) =>
      this.create(data),
    )
    ipcMain.handle(IpcChannels.chatMessage.update, (_e, id: number, data: ChatMessageUpdateInput) =>
      this.update(id, data),
    )
    ipcMain.handle(IpcChannels.chatMessage.remove, (_e, id: number) => this.remove(id))
    ipcMain.handle(IpcChannels.chatMessage.clear, (_e, sessionId: number) => this.clear(sessionId))
  }

  /** 查找某个会话下的全部消息（按 id 升序 = 时间顺序） */
  async findAll(sessionId: number): Promise<ApiResponse<ChatMessageDTO[]>> {
    try {
      const list = await this.repo.find({
        where: { session_id: sessionId },
        order: { id: 'ASC' },
      })
      return success(list)
    } catch (err) {
      return error(`查询消息列表失败：${err}`, [])
    }
  }

  /** 通过 id 查找单条消息 */
  async findOneById(id: number): Promise<ApiResponse<ChatMessageDTO | null>> {
    try {
      const msg = await this.repo.findOneBy({ id })
      if (!msg) return error(`未找到 id 为 ${id} 的消息`, null)
      return success(msg)
    } catch (err) {
      return error(`查询消息失败：${err}`, null)
    }
  }

  /** 新增一条消息 */
  async create(data: ChatMessageCreateInput): Promise<ApiResponse<number>> {
    try {
      const saved = await this.repo.save(this.repo.create(data))
      await this.touchSession(data.session_id)
      return success(saved.id, '新增消息成功')
    } catch (err) {
      return error(`新增消息失败：${err}`)
    }
  }

  /**
   * 修改一条消息
   *
   * 这里刻意用 merge + save 而不是 repo.update：`extra` 是 simple-json 列，
   * TypeORM 对它的深部分类型（_QueryDeepPartialEntity）无法接受对象字面量，
   * merge 走 DeepPartial 路径没有这个限制。
   */
  async update(id: number, data: ChatMessageUpdateInput): Promise<ApiResponse<ChatMessageDTO | null>> {
    try {
      const msg = await this.repo.findOneBy({ id })
      if (!msg) return error(`未找到 id 为 ${id} 的消息，更新失败`, null)
      this.repo.merge(msg, data)
      const saved = await this.repo.save(msg)
      await this.touchSession(saved.session_id)
      return success(saved, '修改消息成功')
    } catch (err) {
      return error(`修改消息失败：${err}`, null)
    }
  }

  /** 删除一条消息 */
  async remove(id: number): Promise<ApiResponse<boolean>> {
    try {
      await this.repo.delete(id)
      return success(true, '删除消息成功')
    } catch (err) {
      return error(`删除消息失败：${err}`, false)
    }
  }

  /** 清空某个会话下的全部消息 */
  async clear(sessionId: number): Promise<ApiResponse<boolean>> {
    try {
      await this.repo.delete({ session_id: sessionId })
      await this.touchSession(sessionId)
      return success(true, '清空消息成功')
    } catch (err) {
      return error(`清空消息失败：${err}`, false)
    }
  }

  /** 刷新会话的更新时间，让列表页的排序跟着最新消息走 */
  private async touchSession(sessionId: number) {
    await this.sessionRepo.update(sessionId, { updated_at: new Date() })
  }
}
