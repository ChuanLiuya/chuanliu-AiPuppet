/**
 * 对话模块 —— 主进程 Controller
 *
 * 职责：接收前端的发送请求，按会话读取历史记录、调用 AI 接口，
 * 并把用户消息与 AI 回复一并落库。
 *
 * 各协议的 HTTP 差异由 providerAdapter 收敛。
 */
import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { ApiConfigEntity } from '@electron/database/entities/api_config'
import { ChatSessionEntity } from '@electron/database/entities/chat_session'
import { ChatMessageEntity } from '@electron/database/entities/chat_message'
import { AppSettingEntity } from '@electron/database/entities/app_setting'
import { AppSettingKey } from '@shared/constants/app_setting'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type {
  ChatMessageDTO,
  ChatSendMessageParams,
  ChatSendMessageResult,
} from '@shared/types/chat'
import { success, error, type ApiResponse } from '@shared/types/api-response'
import { sendOpenAI, toApiMessages } from './providerAdapter'

export class ChatController {
  /** 懒获取 api_config 表的仓库 */
  private get repo() {
    return dataSource.getRepository(ApiConfigEntity)
  }

  /** 懒获取 chat_session 表的仓库 */
  private get sessionRepo() {
    return dataSource.getRepository(ChatSessionEntity)
  }

  /** 懒获取 chat_message 表的仓库 */
  private get messageRepo() {
    return dataSource.getRepository(ChatMessageEntity)
  }

  /** 懒获取 app_setting 表的仓库（读取全局选中的 API 配置） */
  private get settingRepo() {
    return dataSource.getRepository(AppSettingEntity)
  }

  /** 注册 chat 相关的 IPC 通道 */
  register() {
    ipcMain.handle(IpcChannels.chat.send, (_e, params: ChatSendMessageParams) => this.send(params))
  }

  /**
   * 发送一条消息（自带历史记录读写）
   *
   * 完整链路：落库用户消息 → 读取该会话全部历史 → 转成接口 messages
   * → 调用 AI → 落库 AI 回复 → 刷新会话更新时间。
   *
   * 用户消息先落库再调 AI：即使生成失败，输入也不会丢——失败时返回的
   * result 里带着已保存的 user_message，assistant_message 为 null。
   */
  async send(params: ChatSendMessageParams): Promise<ApiResponse<ChatSendMessageResult>> {
    let userMessage: ChatMessageDTO | null = null
    try {
      const session = await this.sessionRepo.findOneBy({ id: params.session_id })
      if (!session) return error('未找到会话')

      // 会话指定了配置就用它，否则回退到全局选中的配置
      const configId = session.api_config_id ?? (await this.getSelectedConfigId())
      if (!configId) return error('尚未选择 API 配置，请先在 API 连接页面选择')

      const cfg = await this.repo.findOne({
        where: { id: configId },
        relations: { api_key: true },
      })
      if (!cfg) return error('未找到 API 配置')
      if (!cfg.api_key) return error('该配置未关联密钥')

      // 1. 先落库用户消息
      userMessage = await this.messageRepo.save(
        this.messageRepo.create({
          session_id: session.id,
          name: params.user_name ?? '你',
          is_user: true,
          is_system: false,
          mes: params.content,
        }),
      )

      // 2. 读取该会话全部历史，转成接口格式（is_system 的消息不会发出）
      const history = await this.messageRepo.find({
        where: { session_id: session.id },
        order: { id: 'ASC' },
      })
      const messages = toApiMessages(history)

      // 3. 调用 AI
      const reply = await sendOpenAI(cfg, messages, { max_tokens: params.max_tokens })

      // 4. 落库 AI 回复
      const assistantMessage = await this.messageRepo.save(
        this.messageRepo.create({
          session_id: session.id,
          name: session.character_name || 'AI',
          is_user: false,
          is_system: false,
          mes: reply.content,
          extra: reply.finish_reason ? { finish_reason: reply.finish_reason } : null,
        }),
      )

      // 5. 刷新会话更新时间（列表按此倒序）
      await this.sessionRepo.update(session.id, { updated_at: new Date() })

      return success({ user_message: userMessage, assistant_message: assistantMessage })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // 用户消息若已落库就带回前端渲染，避免界面上「说过的话消失」
      if (userMessage) {
        return error(`对话失败：${msg}`, { user_message: userMessage, assistant_message: null })
      }
      return error(`对话失败：${msg}`)
    }
  }

  /** 读取全局选中的 API 配置 id（存的是字符串，解析失败按未选处理） */
  private async getSelectedConfigId(): Promise<number | null> {
    const row = await this.settingRepo.findOneBy({ key: AppSettingKey.SELECTED_API_CONFIG_ID })
    const id = Number(row?.value)
    return Number.isFinite(id) && id > 0 ? id : null
  }
}
