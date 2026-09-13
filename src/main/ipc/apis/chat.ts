/**
 * 对话模块 —— 主进程 Controller
 *
 * 职责：接收前端的对话请求，根据用户选中的 API 配置调用 AI 接口，
 * 返回 AI 的回复文本。复用 ApiConfigController.testConnection 中的调用模式。
 */
import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { ApiConfigEntity } from '@electron/database/entities/api_config'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type { ChatSendParams, ChatReplyResult } from '@shared/types/chat'
import { success, error, type ApiResponse } from '@shared/types/api-response'
import { sendChat } from './providerAdapter'

export class ChatController {
  /** 懒获取 api_config 表的仓库 */
  private get repo() {
    return dataSource.getRepository(ApiConfigEntity)
  }

  /** 注册 chat 相关的 IPC 通道 */
  register() {
    ipcMain.handle(IpcChannels.chat.chat, (_e, params: ChatSendParams) => this.chat(params))
  }

  /**
   * 发送对话
   *
   * 根据传入的 api_config_id 查找配置（含密钥），按配置的 protocol
   * 调用对应厂商的接口，返回 AI 回复文本。
   * 各协议在路径、认证头、请求/响应结构上的差异由 providerAdapter 收敛。
   */
  async chat(params: ChatSendParams): Promise<ApiResponse<ChatReplyResult>> {
    try {
      const cfg = await this.repo.findOne({
        where: { id: params.api_config_id },
        relations: { api_key: true },
      })
      if (!cfg) return error('未找到 API 配置')
      if (!cfg.api_key) return error('该配置未关联密钥')

      const reply = await sendChat(cfg.protocol, cfg, {
        messages: params.messages,
        max_tokens: params.max_tokens,
      })

      return success(reply)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return error(`对话失败：${msg}`)
    }
  }
}
