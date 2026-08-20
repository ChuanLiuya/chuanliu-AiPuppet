/**
 * api配置项
 */
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
   * api密钥
   */
  api_key: string
  /**
   * 模型名称
   */
  model: string
  /**
   * 创建时间
   */
  created_at: Date
}

/** 创建 api 配置项的参数（id、created_at 由数据库自动生成） */
export type CreateApiConfigParams = Omit<ApiConfigDTO, 'id' | 'created_at'>

/** 更新 api 配置项的可选字段 */
export type UpdateApiConfigParams = Partial<Omit<ApiConfigDTO, 'id' | 'created_at'>>

