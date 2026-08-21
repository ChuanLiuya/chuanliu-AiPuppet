/**
 * @description API 密钥模块 —— 渲染进程 API（preload/apis/apiKey）
 *
 * 职责：封装 `ipcRenderer.invoke` 调用主进程的 apiKey:* 通道，是渲染进程
 * 访问后端（ApiKeyController）能力的唯一入口。方法名与 `IpcChannels.apiKey`
 * 中的通道名一一对应。
 *
 * 类型来源（双保险）：
 * - 数据契约 `ApiKeyDTO` / `CreateApiKeyParams` / `UpdateApiKeyParams` 来自
 *   `@shared/types/api_key`
 * - 本文件导出的 `ApiKeyApi = typeof apiKeyApi` 随方法签名自动推导，
 *   `env.d.ts` 用它声明 `window.electronAPI.apiKey`——改这里的方法签名，前端类型自动同步
 */
import { ipcRenderer } from 'electron'
import { IpcChannels } from '@electron/ipc/channels'
import type {
  ApiKeyDTO,
  CreateApiKeyParams,
  UpdateApiKeyParams,
} from '@shared/types/api_key'
import type { ApiResponse } from '@shared/types/api-response'

export const apiKeyApi = {
  /**
   * 查找全部密钥
   *
   * 通道：api:apiKey:findAll
   *
   * @returns 统一响应结构，result 为所有密钥的数组
   */
  findAll: (): Promise<ApiResponse<ApiKeyDTO[]>> =>
    ipcRenderer.invoke(IpcChannels.apiKey.findAll),

  /**
   * 通过 id 查找单个密钥
   *
   * 通道：api:apiKey:findOneById
   *
   * @param id 密钥的 id
   * @returns 统一响应结构，result 为找到的密钥；不存在时为 null
   */
  findOneById: (id: number): Promise<ApiResponse<ApiKeyDTO | null>> =>
    ipcRenderer.invoke(IpcChannels.apiKey.findOneById, id),

  /**
   * 新建密钥
   *
   * 通道：api:apiKey:create
   *
   * @param data 创建参数（不含 id、created_at，由数据库自动生成）
   * @returns 统一响应结构，result 为新创建记录的 id
   */
  create: (data: CreateApiKeyParams): Promise<ApiResponse<number>> =>
    ipcRenderer.invoke(IpcChannels.apiKey.create, data),

  /**
   * 修改密钥
   *
   * 通道：api:apiKey:update
   *
   * @param id   要修改的密钥的 id
   * @param data 需要更新的字段（只传要改的字段）
   * @returns 统一响应结构，result 为更新后的密钥；id 不存在时为 null
   */
  update: (id: number, data: UpdateApiKeyParams): Promise<ApiResponse<ApiKeyDTO | null>> =>
    ipcRenderer.invoke(IpcChannels.apiKey.update, id, data),

  /**
   * 删除密钥
   *
   * 通道：api:apiKey:remove
   *
   * @param id 要删除的密钥的 id
   * @returns 统一响应结构，result 为是否删除成功
   */
  remove: (id: number): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke(IpcChannels.apiKey.remove, id),
}

/** apiKeyApi 的类型，供 `env.d.ts` 声明 `window.electronAPI.apiKey` 使用 */
export type ApiKeyApi = typeof apiKeyApi
