import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { CatEntity } from '@electron/database/entities/cat'
import { IpcChannels } from '@electron/ipc/channels'
import type { CatDTO, CatCreateInput, CatUpdateInput } from '@shared/types/cat'
import { success, error, type ApiResponse } from '@shared/types/api-response'

/** 猫的相关api（类型契约来自 shared/types） */
export class CatController {
  /** 懒获取 cat 表的仓库 */
  private get repo() {
    return dataSource.getRepository(CatEntity)
  }

  /** 注册所有 cat 相关的 IPC 通道 */
  register() {
    ipcMain.handle(IpcChannels.cat.findAll, () => this.findAll())
    ipcMain.handle(IpcChannels.cat.findOneById, (_e, id: number) => this.findOneById(id))
    ipcMain.handle(IpcChannels.cat.create, (_e, data: CatCreateInput) => this.create(data))
    ipcMain.handle(IpcChannels.cat.update, (_e, id: number, data: CatUpdateInput) =>
      this.update(id, data),
    )
    ipcMain.handle(IpcChannels.cat.remove, (_e, id: number) => this.remove(id))
  }

  /** 查找所有小猫 */
  async findAll(): Promise<ApiResponse<CatDTO[]>> {
    try {
      const list = await this.repo.find()
      return success(list)
    } catch (err) {
      return error(`查询小猫列表失败：${err}`)
    }
  }

  /** 通过id查找单个小猫 */
  async findOneById(id: number): Promise<ApiResponse<CatDTO | null>> {
    try {
      const cat = await this.repo.findOneBy({ id })
      if (!cat) return error(`未找到 id 为 ${id} 的小猫`, null)
      return success(cat)
    } catch (err) {
      return error(`查询小猫失败：${err}`, null)
    }
  }

  /** 创建一个小猫 */
  async create(data: CatCreateInput): Promise<ApiResponse<number>> {
    try {
      const saved = await this.repo.save(this.repo.create(data))
      return success(saved.id, '创建小猫成功')
    } catch (err) {
      return error(`创建小猫失败：${err}`)
    }
  }

  /** 修改一个小猫 */
  async update(id: number, data: CatUpdateInput): Promise<ApiResponse<CatDTO | null>> {
    try {
      await this.repo.update(id, data)
      const cat = await this.repo.findOneBy({ id })
      if (!cat) return error(`未找到 id 为 ${id} 的小猫，更新失败`, null)
      return success(cat, '修改小猫成功')
    } catch (err) {
      return error(`修改小猫失败：${err}`, null)
    }
  }

  /** 删除一个小猫 */
  async remove(id: number): Promise<ApiResponse<boolean>> {
    try {
      await this.repo.delete(id)
      return success(true, '删除小猫成功')
    } catch (err) {
      return error(`删除小猫失败：${err}`, false)
    }
  }
}

