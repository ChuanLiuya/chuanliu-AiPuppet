/**
 * 应用设置键名常量
 *
 * 所有设置项的 key 集中在此定义，前后端共用，避免魔法字符串。
 * 使用方通过 {@link AppSettingKey.SELECTED_API_CONFIG_ID} 等常量访问。
 */
export const AppSettingKey = {
  /**
   * 用户当前选中的 API 配置 ID（对应 ApiConfigEntity.id）
   */
  SELECTED_API_CONFIG_ID: 'selected_api_config_id',
} as const

/** 设置键名类型 */
export type AppSettingKeyType = (typeof AppSettingKey)[keyof typeof AppSettingKey]
