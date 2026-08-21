/**
 * AI的api配置表
 */
import { ApiConfigDTO } from '@shared/types/api_config'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ApiKeyEntity } from './api_key'

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
   * 关联的密钥（多对一），外键列为 api_key_id
   */
  @ManyToOne(() => ApiKeyEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'api_key_id' })
  api_key!: ApiKeyEntity
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
