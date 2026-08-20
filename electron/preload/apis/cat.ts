
/**
 * @description 猫（Cat）模块 —— 渲染进程 API（preload/apis/cat）
 *
 * 职责：封装 `ipcRenderer.invoke` 调用主进程的 cat:* 通道，是渲染进程
 * 访问后端（CatController）能力的唯一入口。方法名与 `IpcChannels.cat`
 * 中的通道名一一对应。
 *
 * 类型来源（双保险）：
 * - 数据契约 `CatDTO` / `CatCreateInput` / `CatUpdateInput` 来自 `@shared/types/cat`
 * - 本文件导出的 `CatApi = typeof catApi` 随方法签名自动推导，`env.d.ts`
 *   用它声明 `window.electronAPI.cat`——改这里的方法签名，前端类型自动同步
 */
import { ipcRenderer } from 'electron'
import { IpcChannels } from '@electron/ipc/channels'
import type { CatDTO, CatCreateInput, CatUpdateInput } from '@shared/types/cat'

export const catApi = {
  /**
   * 查找全部小猫
   *
   * 通道：api:cat:findAll
   *
   * @returns 所有猫记录的数组
   */
  findAll: (): Promise<CatDTO[]> => ipcRenderer.invoke(IpcChannels.cat.findAll),

  /**
   * 通过 id 查找单个小猫
   *
   * 通道：api:cat:findOneById
   *
   * @param id 猫的 id
   * @returns 找到的猫记录；不存在时返回 null
   */
  findOneById: (id: number): Promise<CatDTO | null> =>
    ipcRenderer.invoke(IpcChannels.cat.findOneById, id),

  /**
   * 创建一只小猫
   *
   * 通道：api:cat:create
   *
   * @param data 创建入参（不含 id，id 由数据库自增生成）
   * @returns 新创建记录的 id
   */
  create: (data: CatCreateInput): Promise<number> =>
    ipcRenderer.invoke(IpcChannels.cat.create, data),

  /**
   * 修改一只小猫
   *
   * 通道：api:cat:update
   *
   * @param id   要修改的猫的 id
   * @param data 需要更新的字段（只传要改的字段）
   * @returns 更新后的猫记录；id 不存在时返回 null
   */
  update: (id: number, data: CatUpdateInput): Promise<CatDTO | null> =>
    ipcRenderer.invoke(IpcChannels.cat.update, id, data),

  /**
   * 删除一只小猫
   *
   * 通道：api:cat:remove
   *
   * @param id 要删除的猫的 id
   * @returns 是否删除成功
   */
  remove: (id: number): Promise<boolean> => ipcRenderer.invoke(IpcChannels.cat.remove, id),
}

/** catApi 的类型，供 `env.d.ts` 声明 `window.electronAPI.cat` 使用 */
export type CatApi = typeof catApi
