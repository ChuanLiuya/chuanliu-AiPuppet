/**
 * 会话表
 *
 * 历史记录的容器：一个角色可以有多个会话（对应 SillyTavern 的多条聊天记录）。
 */
import { ChatSessionDTO } from '@shared/types/chat'
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('chat_session')
// 实体实现共享契约 ChatSessionDTO，保证数据库结构与对外返回结构一致
export class ChatSessionEntity implements ChatSessionDTO {
  /** 会话 id */
  @PrimaryGeneratedColumn()
  id!: number

  /** 会话标题 */
  @Column({ default: '' })
  title!: string

  /**
   * 角色卡
   */
  @Column({ default: '' })
  character_card!: string

  /** 创建时间 */
  @CreateDateColumn()
  created_at!: Date

  /**
   * 最后更新时间
   * 有新消息就刷新此字段
   * 用于前端展示所有会话时的默认顺序
   */
  @UpdateDateColumn()
  updated_at!: Date
}
