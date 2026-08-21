import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { ApiConfigEntity } from '@electron/database/entities/api_config'
import { IpcChannels } from '@electron/ipc/channels'
import type {
  ApiConfigDTO,
  CreateApiConfigParams,
  UpdateApiConfigParams,
} from '@shared/types/api_config'
import { success, error, type ApiResponse } from '@shared/types/api-response'

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
  async findAll(): Promise<ApiResponse<ApiConfigDTO[]>> {
    try {
      const list = await this.repo.find()
      return success(list)
    } catch (err) {
      return error(`查询配置列表失败：${err}`)
    }
  }

  /** 通过 id 查找单个配置项 */
  async findOneById(id: number): Promise<ApiResponse<ApiConfigDTO | null>> {
    try {
      const cfg = await this.repo.findOneBy({ id })
      if (!cfg) return error(`未找到 id 为 ${id} 的配置项`, null)
      return success(cfg)
    } catch (err) {
      return error(`查询配置项失败：${err}`, null)
    }
  }

  /** 新建配置项 */
  async create(data: CreateApiConfigParams): Promise<ApiResponse<number>> {
    try {
      const saved = await this.repo.save(this.repo.create(data))
      return success(saved.id, '新增配置成功')
    } catch (err) {
      return error(`新增配置失败：${err}`)
    }
  }

  /** 修改配置项 */
  async update(id: number, data: UpdateApiConfigParams): Promise<ApiResponse<ApiConfigDTO | null>> {
    try {
      await this.repo.update(id, data)
      const cfg = await this.repo.findOneBy({ id })
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
   */
  // async findModels(
  //   cfg: Pick<ApiConfigDTO, 'base_url' | 'api_key' | 'model'>,
  // ): Promise<ApiResponse<FindModelsResult>> {
  // }
}
