import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { ApiConfigEntity } from '@electron/database/entities/api_config'
import { IpcChannels } from '@electron/ipc/channels'
import type {
  ApiConfigDTO,
  ApiConfigCreateInput,
  ApiConfigUpdateInput,
  ApiConfigTestResult,
} from '@shared/types/api_config'

/** api 配置项的相关 api（类型契约来自 shared/types） */
export class ApiConfigController {
  /** 懒获取 api_config 表的仓库 */
  private get repo() {
    return dataSource.getRepository(ApiConfigEntity)
  }

  /** 注册所有 apiConfig 相关的 IPC 通道 */
  register() {
    ipcMain.handle(IpcChannels.apiConfig.findAll, () => this.findAll())
    ipcMain.handle(IpcChannels.apiConfig.findOneById, (_e, id: number) => this.findOneById(id))
    ipcMain.handle(IpcChannels.apiConfig.create, (_e, data: ApiConfigCreateInput) =>
      this.create(data),
    )
    ipcMain.handle(IpcChannels.apiConfig.update, (_e, id: number, data: ApiConfigUpdateInput) =>
      this.update(id, data),
    )
    ipcMain.handle(IpcChannels.apiConfig.remove, (_e, id: number) => this.remove(id))
    ipcMain.handle(
      IpcChannels.apiConfig.testConnection,
      (_e, cfg: Pick<ApiConfigDTO, 'base_url' | 'api_key' | 'model'>) => this.testConnection(cfg),
    )
  }

  /** 查找所有配置项 */
  async findAll(): Promise<ApiConfigDTO[]> {
    return this.repo.find()
  }

  /** 通过 id 查找单个配置项 */
  async findOneById(id: number): Promise<ApiConfigDTO | null> {
    return this.repo.findOneBy({ id })
  }

  /** 新建配置项 */
  async create(data: ApiConfigCreateInput): Promise<number> {
    const saved = await this.repo.save(this.repo.create(data))
    return saved.id
  }

  /** 修改配置项 */
  async update(id: number, data: ApiConfigUpdateInput): Promise<ApiConfigDTO | null> {
    await this.repo.update(id, data)
    return this.repo.findOneBy({ id })
  }

  /** 删除配置项 */
  async remove(id: number): Promise<boolean> {
    await this.repo.delete(id)
    return true
  }

  /**
   * 测试配置项连通性：请求 `${base_url}/models`（OpenAI 兼容接口），
   * 携带 Authorization 头，超时 10 秒
   */
  async testConnection(
    cfg: Pick<ApiConfigDTO, 'base_url' | 'api_key' | 'model'>,
  ): Promise<ApiConfigTestResult> {
    const baseUrl = cfg.base_url.trim().replace(/\/+$/, '')
    if (!baseUrl) return { ok: false, message: 'API 地址为空' }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    try {
      const res = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${cfg.api_key.trim()}` },
        signal: controller.signal,
      })
      if (res.ok) {
        return { ok: true, message: `连接成功，可访问模型 ${cfg.model.trim() || '默认'}` }
      }
      return { ok: false, message: `连接失败（HTTP ${res.status}）` }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { ok: false, message: '连接超时（10 秒）' }
      }
      return { ok: false, message: err instanceof Error ? err.message : String(err) }
    } finally {
      clearTimeout(timer)
    }
  }
}
