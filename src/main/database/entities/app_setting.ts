/**
 * 应用设置表
 *
 * 通用的键值对存储，用于持久化用户的全局偏好设置。
 * key 为预定义常量（见 @shared/constants/app_setting），value 统一存为字符串。
 */
import { AppSettingDTO } from '@shared/types/app_setting'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('app_setting')
export class AppSettingEntity implements AppSettingDTO {
  /**
   * 设置键名（取值见 @shared/constants/app_setting 中的 AppSettingKey）
   */
  @PrimaryColumn({ type: 'varchar' })
  key!: string

  /**
   * 设置值（统一存为字符串，使用方按需转换）
   */
  @Column({ type: 'text', nullable: true })
  value!: string | null
}
