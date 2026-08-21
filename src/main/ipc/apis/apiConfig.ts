import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { ApiConfigEntity } from '@electron/database/entities/api_config'
import { ApiKeyEntity } from '@electron/database/entities/api_key'
import { IpcChannels } from '@electron/ipc/channels'
import type {
  ApiConfigDTO,
  CreateApiConfigParams,
  findModelsParams,
  FindModelsResult,
  UpdateApiConfigParams,
} from '@shared/types/api_config'
import { success, error, type ApiResponse } from '@shared/types/api-response'
import axios from 'axios'


type AuthType = 'bearer' | 'api-key' | 'query';

interface ProviderConfig {
  endpoint: string;               // 模型列表的相对路径，如 '/v1/models'
  authType: AuthType;
  headerName?: string;            // authType = 'api-key' 时使用的请求头名
  apiKeyParam?: string;           // authType = 'query' 时使用的查询参数名，默认 'key'
}

export class ApiConfigController {

  private _providerMap: Record<string, ProviderConfig> = {
    'https://api.openai.com': {
      endpoint: '/v1/models',
      authType: 'bearer',
    },
    'https://api.deepseek.com': {
      endpoint: '/v1/models',
      authType: 'bearer',
    },
    // Anthropic (Claude)
    'https://api.anthropic.com': {
      endpoint: '/v1/models',
      authType: 'api-key',
      headerName: 'x-api-key',
    },
    // Google Gemini
    'https://generativelanguage.googleapis.com': {
      endpoint: '/v1beta/models',
      authType: 'query',
      apiKeyParam: 'key',
    },
    // OpenRouter
    'https://openrouter.ai': {
      endpoint: '/api/v1/models',
      authType: 'bearer',
    },
  };

  /** 懒获取 api_config 表的仓库 */
  private get repo() {
    return dataSource.getRepository(ApiConfigEntity)
  }

  /** 懒获取 api_key 表的仓库 */
  private get keyRepo() {
    return dataSource.getRepository(ApiKeyEntity)
  }

  /** 注册所有 apiConfig 相关的 IPC 通道 */
  register() {
    ipcMain.handle(IpcChannels.apiConfig.findAll, () => this.findAll())
    ipcMain.handle(IpcChannels.apiConfig.findOneById, (_e, id: number) => this.findOneById(id))
    ipcMain.handle(IpcChannels.apiConfig.create, (_e, data: CreateApiConfigParams) =>
      this.create(data),
    )
    ipcMain.handle(IpcChannels.apiConfig.update, (_e, id: number, data: UpdateApiConfigParams) =>
      this.update(id, data),
    )
    ipcMain.handle(IpcChannels.apiConfig.remove, (_e, id: number) => this.remove(id))
    ipcMain.handle(IpcChannels.apiConfig.findModels, (_e, cfg: findModelsParams) =>
      this.findModels(cfg),
    )
    ipcMain.handle(IpcChannels.apiConfig.testConnection, (_e, id: number) =>
      this.testConnection(id),
    )
  }

  /** 查找所有配置项（含关联密钥） */
  async findAll(): Promise<ApiResponse<ApiConfigDTO[]>> {
    try {
      const list = await this.repo.find({ relations: { api_key: true } })
      return success(list)
    } catch (err) {
      return error(`查询配置列表失败：${err}`)
    }
  }

  /** 通过 id 查找单个配置项（含关联密钥） */
  async findOneById(id: number): Promise<ApiResponse<ApiConfigDTO | null>> {
    try {
      const cfg = await this.repo.findOne({ where: { id }, relations: { api_key: true } })
      if (!cfg) return error(`未找到 id 为 ${id} 的配置项`, null)
      return success(cfg)
    } catch (err) {
      return error(`查询配置项失败：${err}`, null)
    }
  }

  /** 新建配置项 */
  async create(data: CreateApiConfigParams): Promise<ApiResponse<number>> {
    try {
      const { api_key_id, ...rest } = data
      const saved = await this.repo.save(this.repo.create({
        ...rest,
        api_key: { id: api_key_id },
      }))
      return success(saved.id, '新增配置成功')
    } catch (err) {
      return error(`新增配置失败：${err}`)
    }
  }

  /** 修改配置项 */
  async update(id: number, data: UpdateApiConfigParams): Promise<ApiResponse<ApiConfigDTO | null>> {
    try {
      const { api_key_id, ...rest } = data
      const updateData: Record<string, unknown> = { ...rest }
      if (api_key_id != null) {
        updateData.api_key = { id: api_key_id }
      }
      await this.repo.update(id, updateData)
      const cfg = await this.repo.findOne({ where: { id }, relations: { api_key: true } })
      if (!cfg) return error(`未找到 id 为 ${id} 的配置项，更新失败`, null)
      return success(cfg, '保存配置成功')
    } catch (err) {
      return error(`保存配置失败：${err}`, null)
    }
  }

  /** 删除配置项 */
  async remove(id: number): Promise<ApiResponse<boolean>> {
    try {
      await this.repo.delete(id)
      return success(true, '删除配置成功')
    } catch (err) {
      return error(`删除配置失败：${err}`, false)
    }
  }

  /**
   * 查找模型列表
   *
   * 根据 base_url 匹配 provider 配置，使用关联密钥调用各厂商的 /v1/models 接口，
   * 返回可用模型 id 列表。
   */
  async findModels(cfg: findModelsParams): Promise<ApiResponse<FindModelsResult>> {
    try {
      // 通过 key_id 查询关联的密钥
      const apiKey = await this.keyRepo.findOneBy({ id: cfg.api_key_id })
      if (!apiKey) return error(`未找到 id 为 ${cfg.api_key_id} 的密钥`)

      // 匹配 provider 配置，未命中则使用默认的 bearer + /v1/models
      const provider = this._providerMap[cfg.base_url]
      const endpoint = provider?.endpoint ?? '/v1/models'
      const authType = provider?.authType ?? 'bearer'

      // 构造请求头 / 查询参数
      const headers: Record<string, string> = { Accept: 'application/json' }
      let url = cfg.base_url + endpoint

      switch (authType) {
        case 'bearer':
          headers.Authorization = `Bearer ${apiKey.key}`
          break
        case 'api-key':
          headers[provider?.headerName ?? 'x-api-key'] = apiKey.key
          break
        case 'query': {
          const param = provider?.apiKeyParam ?? 'key'
          const sep = url.includes('?') ? '&' : '?'
          url += `${sep}${param}=${encodeURIComponent(apiKey.key)}`
          break
        }
      }

      // 请求模型列表
      const res = await axios({ method: 'get', url, headers, timeout: 10000 })

      // 不同厂商返回结构不同，统一提取模型 id 列表
      const data = res.data
      let models: string[] = []

      if (Array.isArray(data?.data)) {
        // OpenAI / DeepSeek / OpenRouter 格式：{ data: [{ id: "xxx" }] }
        models = data.data.map((m: { id: string }) => m.id).filter(Boolean)
      } else if (Array.isArray(data?.models)) {
        // Gemini 格式：{ models: [{ name: "models/xxx" }] }
        models = data.models
          .map((m: { name: string }) => m.name?.replace(/^models\//, ''))
          .filter(Boolean)
      } else if (Array.isArray(data)) {
        // 直接是数组
        models = data.map((m: { id?: string; name?: string }) => m.id ?? m.name).filter((v): v is string => !!v)
      }

      if (!models.length) {
        return error('未从接口返回中解析到模型列表')
      }

      return success(models, '获取模型列表成功')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return error(`获取模型列表失败：${msg}`)
    }
  }
  /**
   * 测试连接是否正常
   *
   * 使用关联密钥向 DeepSeek 兼容的 chat 接口发送一条 "hello" 消息，
   * 若正常返回则连接测试通过。
   * @param id 配置项id
   */
  async testConnection(id: number): Promise<ApiResponse> {
    try {
      const cfg = await this.repo.findOne({ where: { id }, relations: { api_key: true } })
      if (!cfg) return error(`未找到 id 为 ${id} 的配置项`, false)
      if (!cfg.api_key) return error(`配置项 ${id} 未关联密钥`, false)
      // DeepSeek 兼容格式：Bearer 认证 + /v1/chat/completions
      const url = `${cfg.base_url}/v1/chat/completions`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.api_key.key}`,
      }
      const body = {
        model: cfg.model,
        max_tokens: 16,
        messages: [{ role: 'user', content: 'hello' }],
      }

      const res = await axios({ method: 'post', url, headers, data: body, timeout: 15000 })

      // 简单校验响应是否正常，返回响应体供前端展示
      if (res.status >= 200 && res.status < 300) {
        return success(res.data, `「${cfg.name}」已成功连接`)
      }
      return error(`连接测试失败：HTTP ${res.status}`, false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return error(`连接测试失败：${msg}`, false)
    }
  }
}
