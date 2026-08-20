import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { ApiConfigEntity } from '@electron/database/entities/api_config'
import { IpcChannels } from '@electron/ipc/channels'
import type {
  ApiConfigDTO,
  CreateApiConfigParams,
  UpdateApiConfigParams,
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
    ipcMain.handle(IpcChannels.apiConfig.create, (_e, data: CreateApiConfigParams) =>
      this.create(data),
    )
    ipcMain.handle(IpcChannels.apiConfig.update, (_e, id: number, data: UpdateApiConfigParams) =>
      this.update(id, data),
    )
    ipcMain.handle(IpcChannels.apiConfig.remove, (_e, id: number) => this.remove(id))
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
  async create(data: CreateApiConfigParams): Promise<number> {
    const saved = await this.repo.save(this.repo.create(data))
    return saved.id
  }

  /** 修改配置项 */
  async update(id: number, data: UpdateApiConfigParams): Promise<ApiConfigDTO | null> {
    await this.repo.update(id, data)
    return this.repo.findOneBy({ id })
  }

  /** 删除配置项 */
  async remove(id: number): Promise<boolean> {
    await this.repo.delete(id)
    return true
  }

  /**
   * 查找模型列表
   */
  // async findModels(
  //   cfg: Pick<ApiConfigDTO, 'base_url' | 'api_key' | 'model'>,
  // ): Promise<FindModelsResult> {
  // }
}
