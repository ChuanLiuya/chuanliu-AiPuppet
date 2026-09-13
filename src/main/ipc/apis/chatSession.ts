/**
 * 会话模块 —— 主进程 Controller
 *
 * 职责：处理 chatSession:* 通道的 IPC 请求，对 chat_session 表做 CRUD。
 * 通道定义见 @shared/constants/ipc_channels，数据契约见 @shared/types/chat。
 */
import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { ChatSessionEntity } from '@electron/database/entities/chat_session'
import { ChatMessageEntity } from '@electron/database/entities/chat_message'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type {
  ChatSessionDTO,
  ChatSessionListItem,
  ChatSessionCreateInput,
  ChatSessionUpdateInput,
} from '@shared/types/chat'
import { success, error, type ApiResponse } from '@shared/types/api-response'

export class ChatSessionController {
  /** 懒获取 chat_session 表的仓库 */
  private get repo() {
    return dataSource.getRepository(ChatSessionEntity)
  }

  /** 懒获取 chat_message 表的仓库（删除会话时一并清理） */
  private get messageRepo() {
    return dataSource.getRepository(ChatMessageEntity)
  }

  /** 注册所有 chatSession 相关的 IPC 通道 */
  register() {
    ipcMain.handle(IpcChannels.chatSession.findAll, () => this.findAll())
    ipcMain.handle(IpcChannels.chatSession.listWithPreview, () => this.listWithPreview())
    ipcMain.handle(IpcChannels.chatSession.findOneById, (_e, id: number) => this.findOneById(id))
    ipcMain.handle(IpcChannels.chatSession.create, (_e, data: ChatSessionCreateInput) =>
      this.create(data),
    )
    ipcMain.handle(
      IpcChannels.chatSession.update,
      (_e, id: number, data: ChatSessionUpdateInput) => this.update(id, data),
    )
    ipcMain.handle(IpcChannels.chatSession.remove, (_e, id: number) => this.remove(id))
  }

  /** 查找所有会话（按最后更新时间倒序，最近聊过的排最前） */
  async findAll(): Promise<ApiResponse<ChatSessionDTO[]>> {
    try {
      const list = await this.repo.find({ order: { updated_at: 'DESC' } })
      return success(list)
    } catch (err) {
      return error(`查询会话列表失败：${err}`, [])
    }
  }

  /**
   * 查找所有会话，并附带最后一条消息的正文作为列表预览
   *
   * 目前按会话逐个查最后一条（N+1 次查询）；会话量大了再考虑用
   * 一条聚合 SQL 替换。
   */
  async listWithPreview(): Promise<ApiResponse<ChatSessionListItem[]>> {
    try {
      const sessions = await this.repo.find({ order: { updated_at: 'DESC' } })
      const list: ChatSessionListItem[] = []
      for (const session of sessions) {
        const last = await this.messageRepo.findOne({
          where: { session_id: session.id },
          order: { id: 'DESC' },
        })
        list.push({ ...session, last_message: last?.mes ?? null })
      }
      return success(list)
    } catch (err) {
      return error(`查询会话列表失败：${err}`, [])
    }
  }

  /** 通过 id 查找单个会话 */
  async findOneById(id: number): Promise<ApiResponse<ChatSessionDTO | null>> {
    try {
      const session = await this.repo.findOneBy({ id })
      if (!session) return error(`未找到 id 为 ${id} 的会话`, null)
      return success(session)
    } catch (err) {
      return error(`查询会话失败：${err}`, null)
    }
  }

  /** 创建一个会话 */
  async create(data: ChatSessionCreateInput): Promise<ApiResponse<number>> {
    try {
      // 标题留空时用角色名兜底，保证列表页有可读文本
      const payload = { title: data.character_name, ...data }
      const saved = await this.repo.save(this.repo.create(payload))
      return success(saved.id, '创建会话成功')
    } catch (err) {
      return error(`创建会话失败：${err}`)
    }
  }

  /** 修改一个会话 */
  async update(id: number, data: ChatSessionUpdateInput): Promise<ApiResponse<ChatSessionDTO | null>> {
    try {
      await this.repo.update(id, data)
      const session = await this.repo.findOneBy({ id })
      if (!session) return error(`未找到 id 为 ${id} 的会话，更新失败`, null)
      return success(session, '修改会话成功')
    } catch (err) {
      return error(`修改会话失败：${err}`, null)
    }
  }

  /**
   * 删除一个会话
   *
   * 显式先删消息再删会话，不依赖数据库外键的级联行为
   * （SQLite 需开启 PRAGMA foreign_keys，显式删除更稳）。
   */
  async remove(id: number): Promise<ApiResponse<boolean>> {
    try {
      await this.messageRepo.delete({ session_id: id })
      await this.repo.delete(id)
      return success(true, '删除会话成功')
    } catch (err) {
      return error(`删除会话失败：${err}`, false)
    }
  }
}
