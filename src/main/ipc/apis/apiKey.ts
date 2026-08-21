import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { ApiKeyEntity } from '@electron/database/entities/api_key'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type {
  ApiKeyDTO,
  CreateApiKeyParams,
  UpdateApiKeyParams,
} from '@shared/types/api_key'
import { success, error, type ApiResponse } from '@shared/types/api-response'

/** api 密钥的相关 api（类型契约来自 shared/types） */
export class ApiKeyController {
  /** 懒获取 api_key 表的仓库 */
  private get repo() {
    return dataSource.getRepository(ApiKeyEntity)
  }

  /** 注册所有 apiKey 相关的 IPC 通道 */
  register() {
    ipcMain.handle(IpcChannels.apiKey.findAll, () => this.findAll())
    ipcMain.handle(IpcChannels.apiKey.findOneById, (_e, id: number) => this.findOneById(id))
    ipcMain.handle(IpcChannels.apiKey.create, (_e, data: CreateApiKeyParams) =>
      this.create(data),
    )
    ipcMain.handle(IpcChannels.apiKey.update, (_e, id: number, data: UpdateApiKeyParams) =>
      this.update(id, data),
    )
    ipcMain.handle(IpcChannels.apiKey.remove, (_e, id: number) => this.remove(id))
  }

  /** 查找所有密钥 */
  async findAll(): Promise<ApiResponse<ApiKeyDTO[]>> {
    try {
      const list = await this.repo.find()
      return success(list)
    } catch (err) {
      return error(`查询密钥列表失败：${err}`)
    }
  }

  /** 通过 id 查找单个密钥 */
  async findOneById(id: number): Promise<ApiResponse<ApiKeyDTO | null>> {
    try {
      const key = await this.repo.findOneBy({ id })
      if (!key) return error(`未找到 id 为 ${id} 的密钥`, null)
      return success(key)
    } catch (err) {
      return error(`查询密钥失败：${err}`, null)
    }
  }

  /** 新建密钥 */
  async create(data: CreateApiKeyParams): Promise<ApiResponse<number>> {
    try {
      const saved = await this.repo.save(this.repo.create(data))
      return success(saved.id, '新增密钥成功')
    } catch (err) {
      return error(`新增密钥失败：${err}`)
    }
  }

  /** 修改密钥 */
  async update(id: number, data: UpdateApiKeyParams): Promise<ApiResponse<ApiKeyDTO | null>> {
    try {
      await this.repo.update(id, data)
      const key = await this.repo.findOneBy({ id })
      if (!key) return error(`未找到 id 为 ${id} 的密钥，更新失败`, null)
      return success(key, '保存密钥成功')
    } catch (err) {
      return error(`保存密钥失败：${err}`, null)
    }
  }

  /** 删除密钥 */
  async remove(id: number): Promise<ApiResponse<boolean>> {
    try {
      await this.repo.delete(id)
      return success(true, '删除密钥成功')
    } catch (err) {
      return error(`删除密钥失败：${err}`, false)
    }
  }
}
