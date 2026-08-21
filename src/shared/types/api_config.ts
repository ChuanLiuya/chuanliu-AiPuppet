/**
 * api配置项
 */
import type { ApiKeyDTO } from "./api_key"
export interface ApiConfigDTO {
  /**
   * 配置项id
   */
  id: number
  /**
   * 配置项的名字
   */
  name: string
  /**
   * api的基础路径
   */
  base_url: string
  /**
   * 关联的密钥id
   */
  api_key: ApiKeyDTO
  /**
   * 模型名称
   */
  model: string
  /**
   * 创建时间
   */
  created_at: Date
}

/** 创建 api 配置项的参数（id、created_at 由数据库自动生成，api_key 只需传 id） */
export type CreateApiConfigParams = Omit<ApiConfigDTO, 'id' | 'created_at' | 'api_key'> & {
  /** 关联的密钥 id */
  api_key_id: number
}

/** 更新 api 配置项的可选字段（api_key 只需传 id） */
export type UpdateApiConfigParams = Partial<Omit<ApiConfigDTO, 'id' | 'created_at' | 'api_key'>> & {
  /** 关联的密钥 id */
  api_key_id?: number
}

