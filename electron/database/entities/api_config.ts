/**
 * AI的api配置表
 */
import { ApiConfigDTO } from '@shared/types/api_config'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('api_config')
export class ApiConfigEntity implements ApiConfigDTO {
  /**
   * 配置项id
   */
  @PrimaryGeneratedColumn()
  id!: number
  /**
   * 配置项的名字
   */
  @Column()
  name!: string
  /**
   * api的基础路径
   */
  @Column()
  base_url!: string
  /**
   * api密钥
   */
  @Column()
  api_key!: string
  /**
   * 模型名称
   */
  @Column()
  model!: string
  /**
   * 创建时间
   */
  @CreateDateColumn()
  created_at!: Date
}
