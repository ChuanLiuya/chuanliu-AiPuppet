/**
 * api密钥表
 */
import { ApiKeyDTO } from '@shared/types/api_key'
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ApiConfigEntity } from './api_config'

@Entity('api_key')
export class ApiKeyEntity implements ApiKeyDTO {
  /**
   * 密钥id
   */
  @PrimaryGeneratedColumn()
  id!: number
  /**
   * 密钥
   */
  @Column()
  key!: string
  /**
   * 密钥名称
   */
  @Column()
  name!: string
  /**
   * 创建时间
   */
  @CreateDateColumn()
  created_at!: Date
  /**
   * 关联的 api 配置项列表（一对多）
   */
  @OneToMany(() => ApiConfigEntity, (apiConfig) => apiConfig.api_key)
  api_configs!: ApiConfigEntity[]
}
