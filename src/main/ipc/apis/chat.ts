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
import axios from 'axios'

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
   * 根据传入的 api_config_id 查找配置（含密钥），调用 OpenAI 兼容的
   * /v1/chat/completions 接口，返回 AI 回复文本。
   */
  async chat(params: ChatSendParams): Promise<ApiResponse<ChatReplyResult>> {
    try {
      const cfg = await this.repo.findOne({
        where: { id: params.api_config_id },
        relations: { api_key: true },
      })
      if (!cfg) return error('未找到 API 配置')
      if (!cfg.api_key) return error('该配置未关联密钥')

      // OpenAI 兼容格式：Bearer 认证 + /v1/chat/completions
      const url = `${cfg.base_url}/v1/chat/completions`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.api_key.key}`,
      }
      const body = {
        model: cfg.model,
        max_tokens: params.max_tokens ?? 2048,
        messages: params.messages,
      }

      const res = await axios({
        method: 'post',
        url,
        headers,
        data: body,
        timeout: 60000,
      })

      if (res.status >= 200 && res.status < 300) {
        const choice = res.data?.choices?.[0]
        if (!choice) return error('AI 未返回有效回复')
        return success({
          content: choice.message?.content ?? '',
          finish_reason: choice.finish_reason,
        })
      }
      return error(`对话失败：HTTP ${res.status}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return error(`对话失败：${msg}`)
    }
  }
}
