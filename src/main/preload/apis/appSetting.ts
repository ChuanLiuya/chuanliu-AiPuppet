/**
 * @description 应用设置模块 —— 渲染进程 API（preload/apis/appSetting）
 *
 * 职责：封装 `ipcRenderer.invoke` 调用主进程的 appSetting:* 通道，是渲染进程
 * 访问后端（AppSettingController）能力的唯一入口。方法名与 `IpcChannels.appSetting`
 * 中的通道名一一对应。
 *
 * 类型来源（双保险）：
 * - 数据契约 `AppSettingDTO` 来自 `@shared/types/app_setting`
 * - 本文件导出的 `AppSettingApi = typeof appSettingApi` 随方法签名自动推导，
 *   `env.d.ts` 用它声明 `window.electronAPI.appSetting`——改这里的方法签名，前端类型自动同步
 */
import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type { ApiResponse } from '@shared/types/api-response'

export const appSettingApi = {
  /**
   * 获取单个设置项的值
   *
   * 通道：api:appSetting:get
   *
   * @param key 设置键名（建议使用 @shared/constants/app_setting 中的 AppSettingKey 常量）
   * @returns 统一响应结构，result 为设置值；不存在时为 null
   */
  get: (key: string): Promise<ApiResponse<string | null>> =>
    ipcRenderer.invoke(IpcChannels.appSetting.get, key),

  /**
   * 设置单个设置项的值（不存在则新建，存在则覆盖）
   *
   * 通道：api:appSetting:set
   *
   * @param key   设置键名（建议使用 @shared/constants/app_setting 中的 AppSettingKey 常量）
   * @param value 设置值（统一存为字符串）
   * @returns 统一响应结构，result 为是否保存成功
   */
  set: (key: string, value: string): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke(IpcChannels.appSetting.set, key, value),

  /**
   * 删除单个设置项
   *
   * 通道：api:appSetting:remove
   *
   * @param key 设置键名（建议使用 @shared/constants/app_setting 中的 AppSettingKey 常量）
   * @returns 统一响应结构，result 为是否删除成功
   */
  remove: (key: string): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke(IpcChannels.appSetting.remove, key),
}

/** appSettingApi 的类型，供 `env.d.ts` 声明 `window.electronAPI.appSetting` 使用 */
export type AppSettingApi = typeof appSettingApi
