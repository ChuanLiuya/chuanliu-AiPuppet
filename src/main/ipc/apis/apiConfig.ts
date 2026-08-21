import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { ApiConfigEntity } from '@electron/database/entities/api_config'
import { ApiKeyEntity } from '@electron/database/entities/api_key'
import { IpcChannels } from '@electron/ipc/channels'
import type {
  ApiConfigDTO,
  CreateApiConfigParams,
  UpdateApiConfigParams,
} from '@shared/types/api_config'
import { success, error, type ApiResponse } from '@shared/types/api-response'
// import axios from 'axios'
/** api 配置项的相关 api（类型契约来自 shared/types） */
export class ApiConfigController {
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
   */
  // async findModels(
  //   cfg: Pick<ApiConfigDTO, 'base_url' | 'key_id'>,
  // ): Promise<ApiResponse<FindModelsResult>> {

  //   // 通过 key_id 查询关联的密钥
  //   const apiKey = await this.keyRepo.findOneBy({ id: cfg.key_id })
  //   if (!apiKey) return error(`未找到 id 为 ${cfg.key_id} 的密钥`)

  //   let config = {
  //     method: 'get',
  //     maxBodyLength: Infinity,
  //     url: cfg.base_url + 'model',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization': `Bearer ${apiKey.key}`
  //     }
  //   };

  //   axios(config)
  //     .then((response) => {
  //       console.log(JSON.stringify(response.data));
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }
}
