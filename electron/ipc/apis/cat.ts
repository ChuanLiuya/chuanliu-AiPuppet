import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { CatEntity } from '@electron/database/entities/cat'
import { IpcChannels } from '@electron/ipc/channels'
import type { CatDTO, CatCreateInput, CatUpdateInput } from '@shared/types/cat'

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
  async findAll(): Promise<CatDTO[]> {
    return this.repo.find()
  }

  /** 通过id查找单个小猫 */
  async findOneById(id: number): Promise<CatDTO | null> {
    return this.repo.findOneBy({ id })
  }

  /** 创建一个小猫 */
  async create(data: CatCreateInput): Promise<number> {
    const saved = await this.repo.save(this.repo.create(data))
    return saved.id
  }

  /** 修改一个小猫 */
  async update(id: number, data: CatUpdateInput): Promise<CatDTO | null> {
    await this.repo.update(id, data)
    return this.repo.findOneBy({ id })
  }

  /** 删除一个小猫 */
  async remove(id: number): Promise<boolean> {
    await this.repo.delete(id)
    return true
  }
}

