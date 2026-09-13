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

  /** 会话标题（列表页展示；创建时未传则留空，由前端或后续逻辑补默认值） */
  @Column({ default: '' })
  title!: string

  /** 角色名（角色表落地前先冗余存文本） */
  @Column({ default: '' })
  character_name!: string

  /** 角色头像（emoji 或图片标识） */
  @Column({ default: '' })
  avatar!: string

  /** 创建时间 */
  @CreateDateColumn()
  created_at!: Date

  /** 最后更新时间（有新消息时刷新，列表按此倒序） */
  @UpdateDateColumn()
  updated_at!: Date
}
