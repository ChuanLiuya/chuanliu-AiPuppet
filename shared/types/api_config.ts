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
