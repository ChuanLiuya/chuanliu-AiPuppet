/**
 * 应用设置项
 *
 * 通用的键值对设置，用于存储用户的全局偏好（如选中的 API 配置、默认角色等）。
 * key 为预定义的常量，见 `@shared/constants/app_setting` 中的 {@link AppSettingKey}，
 * 避免散落的魔法字符串。
 */
export interface AppSettingDTO {
  /**
   * 设置键名（取值见 `@shared/constants/app_setting` 中的 AppSettingKey）
   */
  key: string
  /**
   * 设置值（统一存为字符串，使用方按需转换）
   */
  value: string | null
}
