/**
 * @description API 配置模块 —— 渲染进程 API（preload/apis/apiConfig）
 *
 * 职责：封装 `ipcRenderer.invoke` 调用主进程的 apiConfig:* 通道，是渲染进程
 * 访问后端（ApiConfigController）能力的唯一入口。方法名与 `IpcChannels.apiConfig`
 * 中的通道名一一对应。
 *
 * 类型来源（双保险）：
 * - 数据契约 `ApiConfigDTO` / `ApiConfigCreateInput` / `ApiConfigUpdateInput` 来自
 *   `@shared/types/api_config`
 * - 本文件导出的 `ApiConfigApi = typeof apiConfigApi` 随方法签名自动推导，
 *   `env.d.ts` 用它声明 `window.electronAPI.apiConfig`——改这里的方法签名，前端类型自动同步
 */
import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/constants/ipc_channels'
import type {
  ApiConfigDTO,
  CreateApiConfigParams,
  findModelsParams,
  FindModelsResult,
  UpdateApiConfigParams
} from '@shared/types/api_config'
import type { ApiResponse } from '@shared/types/api-response'

export const apiConfigApi = {
  /**
   * 查找全部配置项
   *
   * 通道：api:apiConfig:findAll
   *
   * @returns 统一响应结构，result 为所有配置项的数组
   */
  findAll: (): Promise<ApiResponse<ApiConfigDTO[]>> =>
    ipcRenderer.invoke(IpcChannels.apiConfig.findAll),

  /**
   * 通过 id 查找单个配置项
   *
   * 通道：api:apiConfig:findOneById
   *
   * @param id 配置项的 id
   * @returns 统一响应结构，result 为找到的配置项；不存在时为 null
   */
  findOneById: (id: number): Promise<ApiResponse<ApiConfigDTO | null>> =>
    ipcRenderer.invoke(IpcChannels.apiConfig.findOneById, id),

  /**
   * 新建配置项
   *
   * 通道：api:apiConfig:create
   *
   * @param data 创建参数（不含 id、created_at，由数据库自动生成）
   * @returns 统一响应结构，result 为新创建记录的 id
   */
  create: (data: CreateApiConfigParams): Promise<ApiResponse<number>> =>
    ipcRenderer.invoke(IpcChannels.apiConfig.create, data),

  /**
   * 修改配置项
   *
   * 通道：api:apiConfig:update
   *
   * @param id   要修改的配置项的 id
   * @param data 需要更新的字段（只传要改的字段）
   * @returns 统一响应结构，result 为更新后的配置项；id 不存在时为 null
   */
  update: (id: number, data: UpdateApiConfigParams): Promise<ApiResponse<ApiConfigDTO | null>> =>
    ipcRenderer.invoke(IpcChannels.apiConfig.update, id, data),

  /**
   * 删除配置项
   *
   * 通道：api:apiConfig:remove
   *
   * @param id 要删除的配置项的 id
   * @returns 统一响应结构，result 为是否删除成功
   */
  remove: (id: number): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke(IpcChannels.apiConfig.remove, id),

  /**
   * 获取模型列表
   *
   * 通道：api:apiConfig:findModels
   *
   * @param data 包含 base_url 和 api_key_id 的参数
   * @returns 统一响应结构，result 为可用模型 id 列表
   */
  findModels: (data: findModelsParams): Promise<ApiResponse<FindModelsResult>> =>
    ipcRenderer.invoke(IpcChannels.apiConfig.findModels, data),

  /**
   * 测试连接是否正常
   *
   * 通道：api:apiConfig:testConnection
   *
   * @param id 配置项的 id
   * @returns 统一响应结构，result 为是否连接成功
   */
  testConnection: (id: number): Promise<ApiResponse> =>
    ipcRenderer.invoke(IpcChannels.apiConfig.testConnection, id),

}

/** apiConfigApi 的类型，供 `env.d.ts` 声明 `window.electronAPI.apiConfig` 使用 */
export type ApiConfigApi = typeof apiConfigApi
