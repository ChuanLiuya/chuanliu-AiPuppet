/**
 * AI的api配置表
 */
import { ApiConfigDTO } from '@shared/types/api_config'
import { ApiProtocol } from '@shared/constants/api_protocol'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ApiKeyEntity } from '@electron/database/entities/api_key'

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
   * 接口协议类型
   *
   * 决定调用时用哪套 HTTP 规则（请求路径、认证头、请求/响应结构）。
   *
   * 必须显式写 type：protocol 是字面量联合类型，emitDecoratorMetadata 会把它
   * 反映成 Object 而非 String，TypeORM 无法据此推断列类型。
   * 必须给 default：synchronize 给已有表加列时，无默认值的 NOT NULL 列会失败。
   */
  @Column({ type: 'varchar', default: ApiProtocol.OPENAI })
  protocol!: ApiProtocol
  /**
   * 创建时间
   */
  @CreateDateColumn()
  created_at!: Date
}
