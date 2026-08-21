/**
 * 应用设置模块 —— 主进程 Controller
 *
 * 职责：处理 appSetting:* 通道的 IPC 请求，对 app_setting 表做键值对 CRUD。
 * 通道定义见 @shared/constants/ipc_channels，数据契约见 @shared/types/app_setting。
 */
import { ipcMain } from 'electron'
import { dataSource } from '@electron/database'
import { AppSettingEntity } from '@electron/database/entities/app_setting'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type { AppSettingDTO } from '@shared/types/app_setting'
import { success, error, type ApiResponse } from '@shared/types/api-response'

export class AppSettingController {
  /** 懒获取 app_setting 表的仓库 */
  private get repo() {
    return dataSource.getRepository(AppSettingEntity)
  }

  /** 注册所有 appSetting 相关的 IPC 通道 */
  register() {
    ipcMain.handle(IpcChannels.appSetting.get, (_e, key: string) => this.get(key))
    ipcMain.handle(IpcChannels.appSetting.set, (_e, key: string, value: string) =>
      this.set(key, value),
    )
    ipcMain.handle(IpcChannels.appSetting.remove, (_e, key: string) => this.remove(key))
  }

  /** 获取单个设置项的值 */
  async get(key: string): Promise<ApiResponse<string | null>> {
    try {
      const row = await this.repo.findOneBy({ key })
      return success(row?.value ?? null)
    } catch (err) {
      return error(`查询设置项失败：${err}`, null)
    }
  }

  /** 设置单个设置项的值（不存在则新建，存在则覆盖） */
  async set(key: string, value: string): Promise<ApiResponse<boolean>> {
    try {
      await this.repo.save(this.repo.create({ key, value }))
      return success(true, '设置已保存')
    } catch (err) {
      return error(`保存设置项失败：${err}`, false)
    }
  }

  /** 删除单个设置项 */
  async remove(key: string): Promise<ApiResponse<boolean>> {
    try {
      await this.repo.delete(key)
      return success(true, '设置已删除')
    } catch (err) {
      return error(`删除设置项失败：${err}`, false)
    }
  }
}
