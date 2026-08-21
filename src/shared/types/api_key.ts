/**
 * api密钥项
 */
export interface ApiKeyDTO {
  /**
   * 密钥id
   */
  id: number
  /**
   * 密钥
   */
  key: string
  /**
   * 密钥名称
   */
  name: string
  /**
   * 创建时间
   */
  created_at: Date
}

/** 创建 api 密钥的参数（id、created_at 由数据库自动生成） */
export type CreateApiKeyParams = Omit<ApiKeyDTO, 'id' | 'created_at'>

/** 更新 api 密钥的可选字段 */
export type UpdateApiKeyParams = Partial<Omit<ApiKeyDTO, 'id' | 'created_at'>>
